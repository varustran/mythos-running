"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  Undo2,
  Redo2,
  Minus,
  Sparkles,
  Eye,
  PenTool,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { RichContentRenderer } from "@/components/content/RichContentRenderer";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  locale: Locale;
  placeholder?: string;
  minHeight?: string;
}

const PLACEHOLDERS: Record<string, string> = {
  vi: "Bạn đang nghĩ gì? Hãy chia sẻ câu chuyện, bài viết hoặc kiến thức...",
  en: "What's on your mind? Share your thoughts, article or knowledge...",
  "zh-CN": "你在想什么？分享你的故事、见解或知识...",
  ja: "今何を考えていますか？考えや記事、知識を共有しましょう...",
};

export function TipTapEditor({
  value,
  onChange,
  locale,
  placeholder,
  minHeight = "120px",
}: TipTapEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const effectivePlaceholder = placeholder || PLACEHOLDERS[locale] || PLACEHOLDERS.vi;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-xl bg-canvas p-3 font-mono text-xs my-2.5 border border-line" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-accent/70 pl-3.5 my-2.5 italic text-muted" } },
        bulletList: { HTMLAttributes: { class: "list-disc pl-5 my-2 space-y-1" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-5 my-2 space-y-1" } },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent underline underline-offset-4 font-medium hover:text-accent/80",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-h-96 w-auto my-3 border border-line shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder: effectivePlaceholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-3 border border-line rounded-lg overflow-hidden text-xs",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-line bg-surface font-semibold p-2 text-left text-ink",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-line p-2 text-ink/90",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert max-w-none focus:outline-none text-sm text-ink leading-relaxed px-4 py-3 min-h-[${minHeight}]`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor is empty paragraph, send empty string
      const isEmpty = editor.state.doc.textContent.trim().length === 0 && !editor.isActive("image");
      const finalVal = isEmpty ? "" : html;
      onChange(finalVal);

      // Autosave indicator
      setIsSaved(false);
      try {
        localStorage.setItem("myso_active_composer_draft", finalVal);
        setIsSaved(true);
      } catch {}
    },
  });

  // Sync external value if needed (e.g., cleared on post creation)
  useEffect(() => {
    if (editor && value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  // Set link handler
  const handleApplyLink = () => {
    if (!editor) return;
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setShowLinkDialog(false);
  };

  // Set image handler
  const handleApplyImage = () => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl("");
    setShowImageDialog(false);
  };

  // Insert Table handler
  const handleInsertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) {
    return (
      <div className="min-h-[140px] rounded-2xl border border-line bg-canvas p-4 text-xs text-muted">
        Đang khởi tạo trình soạn thảo WYSIWYG...
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-line bg-canvas shadow-sm transition-all focus-within:border-accent/60">
      {/* Editor Header: Write vs Preview Toggle & Status */}
      <div className="flex items-center justify-between border-b border-line/70 px-3 py-2 bg-surface/40 rounded-t-2xl">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === "write"
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>Viết (WYSIWYG)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activeTab === "preview"
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Xem trước</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[0.7rem] font-mono text-muted">
          {isSaved && (
            <span className="hidden sm:inline-flex items-center gap-1 text-teal font-medium">
              <Check className="h-3 w-3" />
              Đã lưu nháp tự động
            </span>
          )}
          <span className="text-subtle">
            {editor.storage?.characterCount?.words?.() ?? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length} từ
          </span>
        </div>
      </div>

      {/* WYSIWYG Responsive Toolbar (Active when tab is "write") */}
      {activeTab === "write" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-line/60 bg-surface/20 px-2.5 py-1.5 text-xs text-muted overflow-x-auto">
          {/* History Group */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-line/60">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Hoàn tác (Ctrl+Z)"
              className="rounded-md p-1.5 hover:bg-surface hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Làm lại (Ctrl+Shift+Z)"
              className="rounded-md p-1.5 hover:bg-surface hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Typography Group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-line/60">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Tiêu đề H1"
              className={`rounded-md px-1.5 py-1 font-bold text-xs ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-accent/20 text-accent font-black"
                  : "hover:bg-surface hover:text-ink"
              }`}
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Tiêu đề H2"
              className={`rounded-md px-1.5 py-1 font-bold text-xs ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-accent/20 text-accent font-black"
                  : "hover:bg-surface hover:text-ink"
              }`}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              title="Tiêu đề H3"
              className={`rounded-md px-1.5 py-1 font-bold text-xs ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-accent/20 text-accent font-black"
                  : "hover:bg-surface hover:text-ink"
              }`}
            >
              H3
            </button>
          </div>

          {/* Inline Formatting Group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-line/60">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="In đậm (Ctrl+B)"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("bold") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="In nghiêng (Ctrl+I)"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("italic") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Gạch chân (Ctrl+U)"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("underline") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Gạch ngang"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("strike") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="Highlight điểm nhấn"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("highlight") ? "bg-amber-500/20 text-amber-400" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Structure & Lists Group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-line/60">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Danh sách gạch đầu dòng"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("bulletList") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Danh sách số"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("orderedList") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Trích dẫn"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("blockquote") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Khối mã nguồn (Code block)"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("codeBlock") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Đường phân cách"
              className="rounded-md p-1.5 hover:bg-surface hover:text-ink"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inserts Group: Link, Table */}
          <div className="flex items-center gap-0.5 pl-1">
            <button
              type="button"
              onClick={() => {
                setLinkUrl(editor.getAttributes("link").href || "");
                setShowLinkDialog(true);
              }}
              title="Chèn liên kết"
              className={`rounded-md p-1.5 transition ${
                editor.isActive("link") ? "bg-accent/20 text-accent" : "hover:bg-surface hover:text-ink"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              title="Chèn bảng biểu (3x3)"
              className="rounded-md p-1.5 hover:bg-surface hover:text-ink"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Link Dialog Popup */}
      {showLinkDialog && (
        <div className="absolute top-12 left-4 z-30 flex items-center gap-2 rounded-xl border border-line bg-surface p-2 shadow-xl backdrop-blur">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs text-ink placeholder:text-muted focus:outline-none focus:border-accent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyLink();
              } else if (e.key === "Escape") {
                setShowLinkDialog(false);
              }
            }}
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent/90"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={() => setShowLinkDialog(false)}
            className="rounded-lg p-1 text-muted hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body: Live WYSIWYG vs Preview */}
      {activeTab === "write" ? (
        <div className="cursor-text" onClick={() => editor.chain().focus()}>
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div className="p-4 min-h-[140px] bg-canvas/60 rounded-b-2xl">
          {value ? (
            <div
              className="prose dark:prose-invert max-w-none text-sm text-ink leading-relaxed"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <div className="py-8 text-center text-xs text-muted italic">
              Chưa có nội dung để xem trước. Hãy nhập nội dung ở tab Viết.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
