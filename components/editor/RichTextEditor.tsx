"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Minus,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  locale: Locale;
  placeholder?: string;
  minRows?: number;
}

interface CommandItem {
  id: string;
  label: string;
  desc: string;
  prefix: string;
  suffix?: string;
  icon: any;
}

const PLACEHOLDERS: Record<string, string> = {
  vi: "Bạn đang nghĩ gì?",
  en: "What's on your mind?",
  "zh-CN": "你在想什么？",
  ja: "今何を考えていますか？",
};

export function RichTextEditor({
  value,
  onChange,
  locale,
  placeholder,
  minRows = 3,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Slash Command Menu state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // Link dialog modal
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const effectivePlaceholder = placeholder || PLACEHOLDERS[locale] || PLACEHOLDERS.vi;

  // Auto-resize textarea height
  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 88)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Push to undo history stack
  const updateContentWithHistory = (newVal: string) => {
    const trimmedHistory = history.slice(0, historyIndex + 1);
    setHistory([...trimmedHistory, newVal]);
    setHistoryIndex(trimmedHistory.length);
    onChange(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevVal = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextVal = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(nextVal);
    }
  };

  // Insert formatting wrap or block prefix
  const applyFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    // If prefix is line-based (heading, list, quote)
    const isLineBlock = ["# ", "## ", "### ", "> ", "- ", "1. ", "---", "```\n"].includes(prefix);

    let replacement = "";
    let newCursorPos = start;

    if (isLineBlock) {
      // Find start of current line
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeLine = text.substring(0, lineStart);
      const lineAndAfter = text.substring(lineStart);
      replacement = beforeLine + prefix + lineAndAfter;
      newCursorPos = lineStart + prefix.length + (end - start);
      updateContentWithHistory(replacement);
    } else {
      replacement = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
      newCursorPos = start + prefix.length + selected.length + suffix.length;
      updateContentWithHistory(replacement);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Commands available in Slash command menu
  const commands: CommandItem[] = [
    { id: "h1", label: "Tiêu đề lớn 1", desc: "Heading 1 (# )", prefix: "# ", icon: Heading1 },
    { id: "h2", label: "Tiêu đề vừa 2", desc: "Heading 2 (## )", prefix: "## ", icon: Heading2 },
    { id: "h3", label: "Tiêu đề nhỏ 3", desc: "Heading 3 (### )", prefix: "### ", icon: Heading3 },
    { id: "bullet", label: "Danh sách dấu chấm", desc: "Bullet list (- )", prefix: "- ", icon: List },
    { id: "numbered", label: "Danh sách số", desc: "Numbered list (1. )", prefix: "1. ", icon: ListOrdered },
    { id: "quote", label: "Khối trích dẫn", desc: "Blockquote (> )", prefix: "> ", icon: Quote },
    { id: "code", label: "Khối mã nguồn", desc: "Code block (```)", prefix: "```\n", suffix: "\n```", icon: Code },
    { id: "divider", label: "Đường phân cách", desc: "Divider (---)", prefix: "\n---\n", icon: Minus },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const executeSlashCommand = (cmd: CommandItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;

    // Erase the slash '/' and query
    const slashPos = text.lastIndexOf("/", start - 1);
    if (slashPos !== -1) {
      const cleanText = text.substring(0, slashPos) + text.substring(start);
      onChange(cleanText);

      setTimeout(() => {
        textarea.setSelectionRange(slashPos, slashPos);
        applyFormat(cmd.prefix, cmd.suffix || "");
      }, 10);
    } else {
      applyFormat(cmd.prefix, cmd.suffix || "");
    }

    setShowSlashMenu(false);
    setSlashQuery("");
  };

  // Keydown shortcuts: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K, Ctrl+Z, Ctrl+Shift+Z, Slash menu navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Slash command popup navigation
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[slashSelectedIndex]) {
          executeSlashCommand(filteredCommands[slashSelectedIndex]);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    // Ctrl or Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyFormat("**", "**");
          return;
        case "i":
          e.preventDefault();
          applyFormat("*", "*");
          return;
        case "u":
          e.preventDefault();
          applyFormat("<u>", "</u>");
          return;
        case "k":
          e.preventDefault();
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = textarea.value.substring(start, end);
            setLinkText(selected || "liên kết");
            setShowLinkDialog(true);
          }
          return;
        case "z":
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          return;
        case "y":
          e.preventDefault();
          handleRedo();
          return;
      }
    }

    // Detect '/' for slash command
    if (e.key === "/") {
      setShowSlashMenu(true);
      setSlashQuery("");
      setSlashSelectedIndex(0);
    } else if (showSlashMenu && e.key === " ") {
      setShowSlashMenu(false);
    }
  };

  const insertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const formattedLink = `[${linkText.trim() || linkUrl.trim()}](${linkUrl.trim()})`;
    applyFormat(formattedLink, "");
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  };

  return (
    <div className="rich-editor-wrapper relative rounded-2xl border border-line bg-canvas focus-within:border-accent/80 transition shadow-xs">
      {/* Sleek Minimal Toolbar */}
      <div className="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-line/60 bg-surface/50 overflow-x-auto scrollbar-none rounded-t-2xl">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas disabled:opacity-30 transition"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas disabled:opacity-30 transition"
          title="Làm lại (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-line/70 mx-1 shrink-0" />

        {/* Inline styles */}
        <button
          type="button"
          onClick={() => applyFormat("**", "**")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="In đậm (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("*", "*")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("<u>", "</u>")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Gạch chân (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("~~", "~~")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Gạch ngang"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-line/70 mx-1 shrink-0" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => applyFormat("# ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Tiêu đề 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("## ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Tiêu đề 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("### ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Tiêu đề 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-line/70 mx-1 shrink-0" />

        {/* Lists & Quote */}
        <button
          type="button"
          onClick={() => applyFormat("- ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Danh sách dấu chấm"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("1. ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Danh sách số"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("> ")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Khối trích dẫn"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat("```\n", "\n```")}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Khối mã nguồn"
        >
          <Code className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-line/70 mx-1 shrink-0" />

        {/* Link & Slash Command Button */}
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              setLinkText(textarea.value.substring(start, end) || "liên kết");
            }
            setShowLinkDialog(true);
          }}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition"
          title="Chèn liên kết (Ctrl+K)"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setShowSlashMenu(!showSlashMenu);
            setSlashQuery("");
            setSlashSelectedIndex(0);
          }}
          className={`px-2 py-1 rounded-lg text-[0.68rem] font-mono flex items-center gap-1 transition ml-auto ${
            showSlashMenu ? "bg-accent text-white dark:text-[#04101F]" : "text-subtle hover:text-ink hover:bg-canvas"
          }`}
          title="Mở menu lệnh (/)"
        >
          <Command className="h-3 w-3" />
          <span>Lệnh (/)</span>
        </button>
      </div>

      {/* Editor Main Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          updateContentWithHistory(e.target.value);
          if (showSlashMenu) {
            const start = e.target.selectionStart;
            const slashPos = e.target.value.lastIndexOf("/", start - 1);
            if (slashPos !== -1) {
              setSlashQuery(e.target.value.substring(slashPos + 1, start));
            }
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={effectivePlaceholder}
        rows={minRows}
        className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-ink placeholder:text-subtle/80 focus:outline-none resize-none leading-relaxed font-sans"
      />

      {/* Slash Command Palette Modal */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div className="absolute left-4 top-12 z-30 w-72 rounded-2xl border border-line bg-surface p-1.5 shadow-2xl space-y-0.5 animate-in fade-in slide-in-from-top-1">
          <div className="px-2.5 py-1 text-[0.65rem] font-mono uppercase tracking-wider text-subtle border-b border-line/60 flex items-center justify-between">
            <span>LỰA CHỌN ĐỊNH DẠNG</span>
            <span>ESC để đóng</span>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
            {filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === slashSelectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => executeSlashCommand(cmd)}
                  onMouseEnter={() => setSlashSelectedIndex(idx)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                    isSelected ? "bg-accent text-white dark:text-[#04101F]" : "text-ink hover:bg-canvas"
                  }`}
                >
                  <div className={`grid h-7 w-7 place-items-center rounded-lg ${isSelected ? "bg-black/15 text-white dark:text-[#04101F]" : "bg-canvas text-muted border border-line"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight">{cmd.label}</div>
                    <div className={`text-[0.65rem] font-mono ${isSelected ? "opacity-90" : "text-subtle"}`}>
                      {cmd.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Insert Link Dialog Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={insertLink}
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold text-ink">Chèn liên kết (Hyperlink)</span>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="p-1 rounded-lg text-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[0.68rem] font-mono text-subtle block mb-1">Văn bản hiển thị</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Tiêu đề liên kết..."
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[0.68rem] font-mono text-subtle block mb-1">Địa chỉ URL *</label>
                <input
                  required
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted hover:text-ink"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold shadow-xs active:scale-95"
              >
                Chèn Liên Kết
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
