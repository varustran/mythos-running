"use client";

import React, { useMemo } from "react";

// Basic safe HTML sanitizer to prevent XSS while allowing rich styling
function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:[^"']*/gi, "#");
}

export function RichContentRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  // Check if content is rich HTML from TipTap
  const isHtml = useMemo(() => {
    const trimmed = content.trim();
    return (
      (trimmed.startsWith("<p>") ||
        trimmed.startsWith("<h1>") ||
        trimmed.startsWith("<h2>") ||
        trimmed.startsWith("<h3>") ||
        trimmed.startsWith("<blockquote>") ||
        trimmed.startsWith("<ul>") ||
        trimmed.startsWith("<ol>") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<pre>")) &&
      trimmed.includes("</")
    );
  }, [content]);

  // If HTML, render sanitized HTML inside standard prose styles
  if (isHtml) {
    const sanitized = sanitizeHtml(content);
    return (
      <div
        className={`prose dark:prose-invert max-w-none text-ink text-sm sm:text-base leading-relaxed break-words ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Otherwise, use structured Markdown fallback
  return <MarkdownFallbackRenderer content={content} className={className} />;
}

function MarkdownFallbackRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const renderedBlocks = useMemo(() => {
    const rawLines = content.split("\n");
    const blocks: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockLang = "";
    let codeBlockLines: string[] = [];
    let inList = false;
    let listType: "ul" | "ol" = "ul";
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (inList && listItems.length > 0) {
        if (listType === "ul") {
          blocks.push(
            <ul key={`ul-${blocks.length}`} className="my-2.5 ml-4 list-disc space-y-1 text-ink/90">
              {listItems}
            </ul>
          );
        } else {
          blocks.push(
            <ol key={`ol-${blocks.length}`} className="my-2.5 ml-4 list-decimal space-y-1 text-ink/90">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        inList = false;
      }
    };

    const flushCodeBlock = () => {
      if (inCodeBlock) {
        const codeText = codeBlockLines.join("\n");
        blocks.push(
          <div key={`codeblock-${blocks.length}`} className="my-3 rounded-2xl border border-line bg-canvas p-3.5 font-mono text-xs overflow-x-auto shadow-inner">
            {codeBlockLang && (
              <div className="mb-2 text-[0.65rem] uppercase tracking-wider text-accent font-semibold">
                {codeBlockLang}
              </div>
            )}
            <pre className="text-ink leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
        codeBlockLang = "";
      }
    };

    const renderInline = (text: string): React.ReactNode[] => {
      const tokens: React.ReactNode[] = [];
      const regex =
        /(\*\*[^*]+\*\*|\*[^*]+\*|<u>[^<]+<\/u>|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)]+\)|#[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+|@[a-zA-Z0-9_]+)/g;

      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          tokens.push(text.substring(lastIdx, match.index));
        }

        const raw = match[0];
        if (raw.startsWith("**") && raw.endsWith("**")) {
          tokens.push(
            <strong key={`b-${match.index}`} className="font-bold text-ink">
              {raw.slice(2, -2)}
            </strong>
          );
        } else if (raw.startsWith("*") && raw.endsWith("*")) {
          tokens.push(
            <em key={`i-${match.index}`} className="italic">
              {raw.slice(1, -1)}
            </em>
          );
        } else if (raw.startsWith("<u>") && raw.endsWith("</u>")) {
          tokens.push(
            <span key={`u-${match.index}`} className="underline underline-offset-4">
              {raw.slice(3, -4)}
            </span>
          );
        } else if (raw.startsWith("~~") && raw.endsWith("~~")) {
          tokens.push(
            <span key={`s-${match.index}`} className="line-through opacity-70">
              {raw.slice(2, -2)}
            </span>
          );
        } else if (raw.startsWith("`") && raw.endsWith("`")) {
          tokens.push(
            <code
              key={`c-${match.index}`}
              className="rounded-md border border-line bg-canvas px-1.5 py-0.5 font-mono text-[0.85em] text-accent font-medium"
            >
              {raw.slice(1, -1)}
            </code>
          );
        } else if (raw.startsWith("[") && raw.includes("](") && raw.endsWith(")")) {
          const split = raw.indexOf("](");
          const linkTxt = raw.substring(1, split);
          const linkUrl = raw.substring(split + 2, raw.length - 1);
          tokens.push(
            <a
              key={`a-${match.index}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline underline-offset-4 transition hover:text-accent/80"
            >
              {linkTxt}
            </a>
          );
        } else if (raw.startsWith("#")) {
          tokens.push(
            <span
              key={`h-${match.index}`}
              className="inline-block font-semibold text-accent transition hover:underline"
            >
              {raw}
            </span>
          );
        } else if (raw.startsWith("@")) {
          tokens.push(
            <span
              key={`m-${match.index}`}
              className="inline-block font-semibold text-teal transition hover:underline"
            >
              {raw}
            </span>
          );
        }

        lastIdx = match.index + raw.length;
      }

      if (lastIdx < text.length) {
        tokens.push(text.substring(lastIdx));
      }

      return tokens;
    };

    rawLines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check code block ```
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
          codeBlockLines = [];
        } else {
          flushCodeBlock();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Check horizontal rule ---
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        flushList();
        blocks.push(<hr key={`hr-${idx}`} className="my-4 border-line" />);
        return;
      }

      // Check Headings (# H1, ## H2, ### H3)
      if (trimmed.startsWith("### ")) {
        flushList();
        blocks.push(
          <h3 key={`h3-${idx}`} className="font-display text-base font-bold text-ink mt-3 mb-1.5">
            {renderInline(trimmed.slice(4))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        flushList();
        blocks.push(
          <h2 key={`h2-${idx}`} className="font-display text-lg font-bold text-ink mt-4 mb-2">
            {renderInline(trimmed.slice(3))}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith("# ")) {
        flushList();
        blocks.push(
          <h1 key={`h1-${idx}`} className="font-display text-xl font-black text-ink mt-4 mb-2">
            {renderInline(trimmed.slice(2))}
          </h1>
        );
        return;
      }

      // Check Blockquote (> text)
      if (trimmed.startsWith("> ")) {
        flushList();
        blocks.push(
          <blockquote
            key={`quote-${idx}`}
            className="my-3 border-l-4 border-accent/80 bg-surface/50 pl-4 py-2 italic text-ink/90 rounded-r-xl"
          >
            {renderInline(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Check Bullet list (- item or * item)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          flushList();
          inList = true;
          listType = "ul";
        }
        listItems.push(
          <li key={`li-${idx}`} className="leading-relaxed">
            {renderInline(trimmed.slice(2))}
          </li>
        );
        return;
      }

      // Check Numbered list (1. item)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!inList || listType !== "ol") {
          flushList();
          inList = true;
          listType = "ol";
        }
        listItems.push(
          <li key={`li-${idx}`} className="leading-relaxed">
            {renderInline(numMatch[2])}
          </li>
        );
        return;
      }

      // If empty line, flush list and insert spacing
      if (!trimmed) {
        flushList();
        blocks.push(<div key={`sp-${idx}`} className="h-2" />);
        return;
      }

      // Regular paragraph
      flushList();
      blocks.push(
        <p key={`p-${idx}`} className="leading-relaxed text-ink/95 my-1.5 break-words">
          {renderInline(line)}
        </p>
      );
    });

    flushList();
    flushCodeBlock();

    return blocks;
  }, [content]);

  return <div className={`space-y-1 text-sm sm:text-base ${className}`}>{renderedBlocks}</div>;
}
