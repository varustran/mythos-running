"use client";

import React, { useMemo } from "react";

export function RichContentRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  // Safe structured block & inline parser
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
      // Regex for: bold (**text**), italic (*text*), underline (<u>text</u>), strikethrough (~~text~~),
      // code (`code`), links ([text](url)), hashtags (#tag), mentions (@user)
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
            <del key={`del-${match.index}`} className="line-through text-muted">
              {raw.slice(2, -2)}
            </del>
          );
        } else if (raw.startsWith("`") && raw.endsWith("`")) {
          tokens.push(
            <code
              key={`c-${match.index}`}
              className="rounded-md bg-canvas/80 px-1.5 py-0.5 font-mono text-[0.88em] text-accent border border-line"
            >
              {raw.slice(1, -1)}
            </code>
          );
        } else if (raw.startsWith("[") && raw.includes("](") && raw.endsWith(")")) {
          const textPart = raw.slice(1, raw.indexOf("]("));
          const urlPart = raw.slice(raw.indexOf("](") + 2, -1);
          // Sanitize URL
          const safeUrl = urlPart.startsWith("http://") || urlPart.startsWith("https://") || urlPart.startsWith("/") ? urlPart : "#";
          tokens.push(
            <a
              key={`a-${match.index}`}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="text-accent underline underline-offset-2 font-medium hover:opacity-80 transition"
            >
              {textPart}
            </a>
          );
        } else if (raw.startsWith("#")) {
          tokens.push(
            <span
              key={`h-${match.index}`}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              {raw}
            </span>
          );
        } else if (raw.startsWith("@")) {
          tokens.push(
            <span
              key={`m-${match.index}`}
              className="text-teal font-semibold hover:underline cursor-pointer"
            >
              {raw}
            </span>
          );
        }

        lastIdx = regex.lastIndex;
      }

      if (lastIdx < text.length) {
        tokens.push(text.substring(lastIdx));
      }

      return tokens;
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Code block start/end ```
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          codeBlockLang = line.trim().slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Horizontal Divider ---
      if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        blocks.push(<hr key={`hr-${i}`} className="my-4 border-line/60" />);
        continue;
      }

      // Headings
      if (line.startsWith("# ")) {
        flushList();
        blocks.push(
          <h1 key={`h1-${i}`} className="mt-4 mb-2 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {renderInline(line.slice(2))}
          </h1>
        );
        continue;
      }

      if (line.startsWith("## ")) {
        flushList();
        blocks.push(
          <h2 key={`h2-${i}`} className="mt-3.5 mb-1.5 font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
            {renderInline(line.slice(3))}
          </h2>
        );
        continue;
      }

      if (line.startsWith("### ")) {
        flushList();
        blocks.push(
          <h3 key={`h3-${i}`} className="mt-3 mb-1 font-display text-base sm:text-lg font-semibold tracking-tight text-ink">
            {renderInline(line.slice(4))}
          </h3>
        );
        continue;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        flushList();
        blocks.push(
          <blockquote
            key={`bq-${i}`}
            className="my-2 border-l-4 border-accent bg-accent/5 py-1.5 px-3.5 rounded-r-xl text-ink/90 italic"
          >
            {renderInline(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Bullet List
      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          flushList();
          inList = true;
          listType = "ul";
        }
        listItems.push(<li key={`li-${i}`}>{renderInline(line.slice(2))}</li>);
        continue;
      }

      // Numbered List
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (!inList || listType !== "ol") {
          flushList();
          inList = true;
          listType = "ol";
        }
        listItems.push(<li key={`li-${i}`}>{renderInline(numMatch[2])}</li>);
        continue;
      }

      // End of list reached
      if (inList) {
        flushList();
      }

      // Empty line / paragraph gap
      if (!line.trim()) {
        blocks.push(<div key={`gap-${i}`} className="h-2" />);
        continue;
      }

      // Standard Paragraph
      blocks.push(
        <p key={`p-${i}`} className="my-1 text-ink/90 leading-relaxed break-words">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    flushCodeBlock();

    return blocks;
  }, [content]);

  return <div className={`rich-content-body space-y-1 ${className}`}>{renderedBlocks}</div>;
}
