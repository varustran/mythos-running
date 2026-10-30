"use client";

import React from "react";

export function RichContentRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  // Format inline markdown (bold, italic, code, links, hashtags, mentions)
  const formatText = (text: string) => {
    // Split by lines first
    const lines = text.split("\n");

    return lines.map((line, lineIdx) => {
      // Check for blockquote
      const isQuote = line.startsWith("> ");
      const cleanLine = isQuote ? line.slice(2) : line;

      // Regex parser for tokens: bold (**text**), italic (*text*), code (`code`), hashtag (#tag), mention (@user), link ([text](url))
      const tokens: React.ReactNode[] = [];
      const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|#[a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]+|@[a-zA-Z0-9_]+)/g;

      let lastIndex = 0;
      let match;

      while ((match = regex.exec(cleanLine)) !== null) {
        // Plain text before match
        if (match.index > lastIndex) {
          tokens.push(cleanLine.substring(lastIndex, match.index));
        }

        const raw = match[0];
        if (raw.startsWith("**") && raw.endsWith("**")) {
          // Bold
          tokens.push(
            <strong key={`b-${match.index}`} className="font-bold text-ink">
              {raw.slice(2, -2)}
            </strong>
          );
        } else if (raw.startsWith("*") && raw.endsWith("*")) {
          // Italic
          tokens.push(
            <em key={`i-${match.index}`} className="italic">
              {raw.slice(1, -1)}
            </em>
          );
        } else if (raw.startsWith("`") && raw.endsWith("`")) {
          // Inline code
          tokens.push(
            <code
              key={`c-${match.index}`}
              className="rounded bg-canvas/80 px-1.5 py-0.5 font-mono text-[0.85em] text-accent border border-line"
            >
              {raw.slice(1, -1)}
            </code>
          );
        } else if (raw.startsWith("[") && raw.includes("](") && raw.endsWith(")")) {
          // Link
          const linkText = raw.slice(1, raw.indexOf("]("));
          const linkUrl = raw.slice(raw.indexOf("](") + 2, -1);
          tokens.push(
            <a
              key={`a-${match.index}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="text-accent underline font-medium hover:opacity-80"
            >
              {linkText}
            </a>
          );
        } else if (raw.startsWith("#")) {
          // Hashtag
          tokens.push(
            <span
              key={`h-${match.index}`}
              className="text-accent font-semibold hover:underline cursor-pointer"
            >
              {raw}{" "}
            </span>
          );
        } else if (raw.startsWith("@")) {
          // Mention
          tokens.push(
            <span
              key={`m-${match.index}`}
              className="text-teal font-semibold hover:underline cursor-pointer"
            >
              {raw}{" "}
            </span>
          );
        }

        lastIndex = regex.lastIndex;
      }

      // Remaining plain text
      if (lastIndex < cleanLine.length) {
        tokens.push(cleanLine.substring(lastIndex));
      }

      if (isQuote) {
        return (
          <blockquote
            key={lineIdx}
            className="my-1.5 border-l-4 border-accent pl-3 text-muted italic bg-surface/50 py-1 rounded-r-lg"
          >
            {tokens.length > 0 ? tokens : <span>&nbsp;</span>}
          </blockquote>
        );
      }

      return (
        <span key={lineIdx} className="block leading-relaxed">
          {tokens.length > 0 ? tokens : <span>&nbsp;</span>}
        </span>
      );
    });
  };

  return <div className={`text-ink leading-relaxed ${className}`}>{formatText(content)}</div>;
}
