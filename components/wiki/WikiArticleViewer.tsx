"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Code,
  Save,
  Eye,
  History,
  MessageSquare,
  FileText,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Clock,
  User,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import type { WikiArticleItem } from "@/lib/wiki/wikipedia";

interface RevisionLog {
  id: string;
  timestamp: string;
  authorIp: string;
  summary: string;
  bytesChange: number;
}

export function WikiArticleViewer({
  initialArticle,
  locale,
}: {
  initialArticle: WikiArticleItem;
  locale: Locale;
}) {
  const [activeTab, setActiveTab] = useState<"article" | "edit" | "history" | "talk">("article");
  const [article, setArticle] = useState<WikiArticleItem>(initialArticle);
  const [content, setContent] = useState<string>(initialArticle.content);
  const [title, setTitle] = useState<string>(initialArticle.title);
  const [summary, setSummary] = useState<string>(initialArticle.summary);
  const [editSummary, setEditSummary] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // History logs
  const [historyLogs, setHistoryLogs] = useState<RevisionLog[]>([
    {
      id: "rev-0",
      timestamp: initialArticle.lastUpdated || "2026-10-30 14:00",
      authorIp: "113.161.***.***",
      summary: "Phiên bản khởi tạo ban đầu, tổng hợp từ Wikipedia & tài liệu chuyên ngành",
      bytesChange: initialArticle.content.length,
    },
  ]);

  // Talk/Discussion comments
  const [talkComments, setTalkComments] = useState<
    { id: string; author: string; text: string; date: string }[]
  >([
    {
      id: "talk-1",
      author: "Biên tập viên Myso",
      text: "Chào mừng mọi người thảo luận về tính chính xác và bổ sung các nguồn trích dẫn học thuật cho bài viết này theo quy chuẩn bách khoa mở.",
      date: "2026-10-30",
    },
  ]);
  const [newTalkText, setNewTalkText] = useState("");
  const [newTalkAuthor, setNewTalkAuthor] = useState("");

  // Toolbar action helpers
  const insertFormatting = (prefix: string, suffix: string = "", placeholder: string = "văn bản") => {
    const textarea = document.getElementById("wiki-editor-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleSaveEdit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/wiki/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          title,
          summary: summary || title,
          content_md: content,
          edit_summary: editSummary || "Chỉnh sửa nội dung chi tiết bài viết",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Không thể lưu bài viết.");
      } else {
        const updatedArticle = {
          ...article,
          title,
          summary: summary || title,
          content,
          lastUpdated: new Date().toISOString().split("T")[0],
          contributorsCount: (article.contributorsCount || 1) + 1,
        };
        setArticle(updatedArticle);

        // Add to history log
        const newLog: RevisionLog = {
          id: `rev-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          authorIp: "Bạn (IP hiện tại)",
          summary: editSummary || "Chỉnh sửa nội dung chi tiết bài viết",
          bytesChange: content.length - article.content.length,
        };
        setHistoryLogs([newLog, ...historyLogs]);

        setSaveSuccess("Thay đổi của bạn đã được xuất bản trực tiếp lên Myso Wiki!");
        setEditSummary("");
        setTimeout(() => {
          setActiveTab("article");
          setSaveSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setSaveError(err.message || "Lỗi mạng khi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTalkComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTalkText.trim()) return;
    const comment = {
      id: `talk-${Date.now()}`,
      author: newTalkAuthor.trim() || "Thành viên ẩn danh",
      text: newTalkText.trim(),
      date: new Date().toLocaleDateString(),
    };
    setTalkComments([...talkComments, comment]);
    setNewTalkText("");
  };

  return (
    <article className="container-page py-10 sm:py-14 max-w-4xl">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={localePath(locale, "/wiki")}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4 text-accent" />
          <span>{locale === "vi" ? "Trở về danh mục Bách khoa Myso" : "Back to Myso Wiki"}</span>
        </Link>
        <span className="font-mono text-xs text-subtle">
          Mã định danh: <code className="text-ink font-semibold">{article.slug}</code>
        </span>
      </div>

      {/* Wikipedia-Style Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-line mb-8 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("article")}
            className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === "article"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink hover:border-line"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Bài viết</span>
          </button>

          <button
            onClick={() => setActiveTab("talk")}
            className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === "talk"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink hover:border-line"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Thảo luận ({talkComments.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setActiveTab("edit");
              setPreviewMode(false);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === "edit"
                ? "border-teal text-teal"
                : "border-transparent text-muted hover:text-ink hover:border-line"
            }`}
          >
            <Bold className="h-4 w-4 text-teal" />
            <span>Chỉnh sửa mã nguồn</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === "history"
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink hover:border-line"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Xem lịch sử</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ARTICLE VIEW */}
      {activeTab === "article" && (
        <div className="animate-fade-in space-y-8">
          <div className="border-b border-line pb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-accent/10 px-3 py-0.5 font-mono text-xs text-accent font-semibold">
                {article.domain}
              </span>
              <span className="font-mono text-xs text-subtle">
                Bách khoa toàn thư mở Myso
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
              {article.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed font-sans">
              {article.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-subtle pt-4 border-t border-line/60">
              <span>{article.views.toLocaleString()} lượt xem thực tế</span>
              <span>{article.contributorsCount} thành viên đã đóng góp</span>
              <span>Cập nhật gần nhất: {article.lastUpdated}</span>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-ink leading-relaxed font-sans">
            {article.content.split("\n\n").map((para, i) => {
              if (para.startsWith("### ")) {
                return (
                  <h3 key={i} className="font-display text-xl font-bold mt-8 mb-3 text-ink">
                    {para.replace("### ", "")}
                  </h3>
                );
              }
              if (para.startsWith("## ")) {
                return (
                  <h2 key={i} className="font-display text-2xl font-bold mt-10 mb-4 text-ink border-b border-line/60 pb-2">
                    {para.replace("## ", "")}
                  </h2>
                );
              }
              if (para.startsWith("1. ") || para.startsWith("- ")) {
                const lines = para.split("\n");
                return (
                  <ul key={i} className="space-y-2 my-4 list-disc pl-5">
                    {lines.map((l, j) => (
                      <li key={j} className="text-sm sm:text-base leading-relaxed text-muted">
                        {l.replace(/^[0-9]+\.\s+|^-\s+/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (para.startsWith("> ")) {
                return (
                  <blockquote key={i} className="border-l-4 border-accent pl-4 italic text-muted my-4">
                    {para.replace("> ", "")}
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-sm sm:text-base leading-relaxed text-muted mb-4">
                  {para}
                </p>
              );
            })}
          </div>

          {/* Source References */}
          <div className="mt-12 rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4" />
              Tài liệu tham khảo & Nguồn dẫn bách khoa
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted">{article.sourceName}</span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Xem liên kết nguồn gốc <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WIKIPEDIA-STYLE EDIT SOURCE */}
      {activeTab === "edit" && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-6 border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-teal font-semibold">
                  TRÌNH SOẠN THẢO BÁCH KHOA MYSO
                </span>
                <h3 className="font-display text-xl font-bold text-ink mt-0.5">
                  Sửa đổi: {article.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                    !previewMode
                      ? "bg-accent text-white dark:text-[#04101F]"
                      : "border border-line bg-canvas text-muted hover:text-ink"
                  }`}
                >
                  Mã nguồn
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                    previewMode
                      ? "bg-accent text-white dark:text-[#04101F]"
                      : "border border-line bg-canvas text-muted hover:text-ink"
                  }`}
                >
                  <Eye className="inline h-3.5 w-3.5 mr-1" />
                  Xem trước trực tiếp
                </button>
              </div>
            </div>

            {/* Wikipedia Toolbar */}
            {!previewMode && (
              <div className="flex flex-wrap items-center gap-1 p-2 rounded-xl border border-line bg-canvas mb-4 text-ink">
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**", "in đậm")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="In đậm (Bold)"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*", "in nghiêng")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="In nghiêng (Italic)"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <span className="h-4 w-px bg-line mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("## ", "", "Tiêu đề mục lớn")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Tiêu đề đề mục (Heading 2)"
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("### ", "", "Tiêu đề mục phụ")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Tiêu đề mục con (Heading 3)"
                >
                  <Heading3 className="h-4 w-4" />
                </button>
                <span className="h-4 w-px bg-line mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("[", "](https://...)", "Tên liên kết")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Thêm liên kết (Link)"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<ref>[", " Nguồn trích dẫn]</ref>", "https://...")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Chèn nguồn trích dẫn (<ref>)"
                >
                  <BookOpen className="h-4 w-4 text-teal" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("> ", "", "Đoạn trích dẫn nguyên văn")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Khối trích dẫn (Blockquote)"
                >
                  <Quote className="h-4 w-4" />
                </button>
                <span className="h-4 w-px bg-line mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("- ", "", "Mục danh sách")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Danh sách dấu chấm"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("1. ", "", "Mục thứ tự")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Danh sách đánh số"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n| Cột 1 | Cột 2 |\n| --- | --- |\n| Dữ liệu 1 | Dữ liệu 2 |\n", "", "")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Chèn bảng (Table)"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```\n", "\n```", "mã nguồn")}
                  className="p-2 rounded hover:bg-surface transition"
                  title="Khối mã (Code block)"
                >
                  <Code className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Editor Area */}
            {!previewMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[0.68rem] text-subtle uppercase tracking-wider mb-1">
                    Tiêu đề bách khoa:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas p-3 text-sm font-semibold text-ink focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[0.68rem] text-subtle uppercase tracking-wider mb-1">
                    Nội dung mã nguồn (Markdown / Wiki Source):
                  </label>
                  <textarea
                    id="wiki-editor-textarea"
                    rows={18}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas p-4 text-sm font-mono text-ink focus:border-accent focus:outline-none leading-relaxed transition"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-canvas p-6 min-h-[350px] prose prose-slate dark:prose-invert max-w-none text-ink">
                <h1 className="font-display text-3xl font-bold mb-4">{title}</h1>
                {content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm sm:text-base text-muted leading-relaxed mb-3">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Edit Summary Input (Wikipedia Standard) */}
            <div className="mt-6 pt-5 border-t border-line/60 space-y-4">
              <div>
                <label className="block font-mono text-xs text-ink font-semibold mb-1 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-accent" />
                  Tóm tắt sửa đổi (Edit Summary):
                </label>
                <input
                  type="text"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Mô tả ngắn gọn những gì bạn đã sửa (VD: Sửa chính tả, bổ sung tiêu chuẩn W3C, cập nhật 2026...)"
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-xs sm:text-sm text-ink focus:border-accent focus:outline-none transition"
                />
              </div>

              {saveError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="rounded-xl bg-teal/10 border border-teal/30 p-3.5 text-xs text-teal font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="text-[0.68rem] text-subtle max-w-md leading-relaxed">
                  Bằng việc nhấn "Lưu thay đổi", bạn đồng ý xuất bản nội dung này theo giấy phép mở Creative Commons và cam kết không vi phạm bản quyền.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("article")}
                    className="rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs font-semibold text-muted hover:text-ink transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Đang xuất bản..." : "Lưu thay đổi (Save Changes)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVISION HISTORY (Wikipedia Standard) */}
      {activeTab === "history" && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-6 border border-line bg-surface shadow-md">
            <h3 className="font-display text-lg font-bold text-ink mb-1">
              Lịch sử chỉnh sửa của trang: {article.title}
            </h3>
            <p className="text-xs text-muted mb-6">
              Mọi phiên bản đều được lưu vết thời gian, định danh tác giả (IP ẩn danh) và tóm tắt thay đổi để đảm bảo tính minh bạch.
            </p>

            <div className="space-y-3">
              {historyLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-line bg-canvas p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      <span className="font-semibold text-ink">{log.timestamp}</span>
                      <span className="text-subtle">·</span>
                      <span className="text-teal">{log.authorIp}</span>
                      <span className="text-subtle">·</span>
                      <span className={`text-[0.68rem] ${log.bytesChange >= 0 ? "text-teal" : "text-red-400"}`}>
                        ({log.bytesChange >= 0 ? `+${log.bytesChange}` : log.bytesChange} bytes)
                      </span>
                    </div>
                    <p className="text-xs text-muted italic">"{log.summary}"</p>
                  </div>

                  <span className="text-[0.68rem] font-mono rounded bg-surface px-2 py-1 text-subtle border border-line/60 self-start sm:self-auto">
                    {idx === 0 ? "Bản hiện tại" : "Bản lưu trữ"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TALK / DISCUSSION (Wikipedia Standard) */}
      {activeTab === "talk" && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-6 border border-line bg-surface shadow-md">
            <h3 className="font-display text-lg font-bold text-ink mb-1">
              Trang thảo luận: {article.title}
            </h3>
            <p className="text-xs text-muted mb-6">
              Nơi độc giả và các biên tập viên trao đổi, góp ý về nội dung, tính khách quan và bổ sung nguồn trích dẫn cho bài viết.
            </p>

            <div className="space-y-4 mb-8">
              {talkComments.map((t) => (
                <div key={t.id} className="rounded-xl border border-line bg-canvas p-4">
                  <div className="flex items-center justify-between text-xs font-mono text-subtle mb-2">
                    <span className="font-semibold text-accent flex items-center gap-1.5">
                      <User className="h-3 w-3" /> {t.author}
                    </span>
                    <span>{t.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-ink leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>

            {/* Post a comment */}
            <form onSubmit={handleAddTalkComment} className="border-t border-line/60 pt-5 space-y-3">
              <h4 className="font-mono text-xs text-ink font-semibold uppercase tracking-wider">
                Thêm ý kiến thảo luận mới:
              </h4>
              <input
                type="text"
                value={newTalkAuthor}
                onChange={(e) => setNewTalkAuthor(e.target.value)}
                placeholder="Tên của bạn hoặc bút danh (để trống nếu ẩn danh)..."
                className="w-full rounded-xl border border-line bg-canvas p-2.5 text-xs text-ink focus:border-accent focus:outline-none"
              />
              <textarea
                rows={3}
                required
                value={newTalkText}
                onChange={(e) => setNewTalkText(e.target.value)}
                placeholder="Ý kiến đóng góp, phản biện khoa học hoặc đề xuất cải tiến nội dung..."
                className="w-full rounded-xl border border-line bg-canvas p-3 text-xs sm:text-sm text-ink focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-sm"
              >
                Gửi ý kiến thảo luận
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
