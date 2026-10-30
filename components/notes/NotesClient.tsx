"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Lock, Flame, Clock, Share2, Sparkles, FileText, Eye, ShieldAlert } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

interface SavedLocalNote {
  slug: string;
  title: string;
  date: string;
}

export function NotesClient({ locale }: { locale: Locale }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentNotes, setRecentNotes] = useState<SavedLocalNote[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("myso_recent_notes");
      if (stored) setRecentNotes(JSON.parse(stored));
    } catch {}
  }, []);

  const handleCreate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setCreatedUrl(null);
    try {
      const res = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content,
          password: isProtected ? password : null,
          burn_after_read: burnAfterRead,
          expiry_hours: expiryHours,
        }),
      });

      const data = await res.json();
      if (data.success && data.slug) {
        const fullUrl = `${window.location.origin}${localePath(locale, `/notes/view?id=${data.slug}`)}`;
        setCreatedUrl(fullUrl);

        // Save to local storage for quick access
        const newNoteItem: SavedLocalNote = {
          slug: data.slug,
          title: title.trim() || "Ghi chú không tiêu đề",
          date: new Date().toLocaleDateString(),
        };
        const updatedRecent = [newNoteItem, ...recentNotes.slice(0, 4)];
        setRecentNotes(updatedRecent);
        try {
          localStorage.setItem("myso_recent_notes", JSON.stringify(updatedRecent));
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Editor Card */}
      <div className="card p-6 sm:p-8 border border-line bg-surface shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4 mb-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
              MYSO NOTES (NOTE2S ED.)
            </span>
          </div>
          <div className="font-mono text-xs text-subtle space-x-3">
            <span>{words} từ</span>
            <span>·</span>
            <span>{chars} ký tự</span>
          </div>
        </div>

        {/* Note Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={locale === "vi" ? "Tiêu đề ghi chú (tùy chọn)..." : "Note title (optional)..."}
          className="w-full font-display text-lg sm:text-xl font-bold bg-transparent border-none text-ink placeholder:text-muted focus:outline-none mb-4"
        />

        {/* Main Textarea */}
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            locale === "vi"
              ? "Dán hoặc viết văn bản, mật khẩu tạm, tài liệu, mã nguồn bí mật tại đây... Không cần tài khoản."
              : "Paste or write secret notes, code snippets, temporary passwords here... No sign-up required."
          }
          className="w-full rounded-2xl border border-line bg-canvas p-4 text-sm sm:text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none transition font-sans leading-relaxed"
        />

        {/* Note Options (Security, Expiry, Self-destruct) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3 pt-5 border-t border-line/60">
          {/* 1. Password Protect */}
          <div className="rounded-xl border border-line bg-canvas p-3.5 flex flex-col justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="rounded border-line text-accent focus:ring-accent"
              />
              <Lock className="h-3.5 w-3.5 text-accent" />
              <span>Đặt mật khẩu</span>
            </label>
            {isProtected && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mã mở khóa..."
                className="w-full rounded-lg border border-line bg-surface p-2 text-xs text-ink focus:border-accent focus:outline-none transition mt-1"
              />
            )}
          </div>

          {/* 2. Burn after read */}
          <div className="rounded-xl border border-line bg-canvas p-3.5 flex flex-col justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={burnAfterRead}
                onChange={(e) => setBurnAfterRead(e.target.checked)}
                className="rounded border-line text-accent focus:ring-accent"
              />
              <Flame className="h-3.5 w-3.5 text-red-400" />
              <span>Tự hủy sau khi đọc</span>
            </label>
            <p className="text-[0.65rem] text-muted">Ghi chú sẽ xóa sạch vĩnh viễn ngay sau lượt xem đầu tiên.</p>
          </div>

          {/* 3. Expiration */}
          <div className="rounded-xl border border-line bg-canvas p-3.5 flex flex-col justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink mb-1">
              <Clock className="h-3.5 w-3.5 text-teal" />
              <span>Thời gian lưu trữ</span>
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-surface p-1.5 text-xs text-ink focus:border-accent focus:outline-none transition"
            >
              <option value={1}>Hết hạn sau 1 giờ</option>
              <option value={24}>Hết hạn sau 24 giờ</option>
              <option value={168}>Hết hạn sau 7 ngày</option>
              <option value={0}>Lưu trữ vĩnh viễn</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={loading || !content.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-lg disabled:opacity-40"
          >
            <Share2 className="h-4 w-4" />
            {loading ? "Đang tạo link bảo mật..." : "Tạo Link Chia Sẻ Ngay"}
          </button>
        </div>

        {/* Created Share Link Box */}
        {createdUrl && (
          <div className="mt-6 rounded-2xl border border-teal/40 bg-teal/5 p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-teal font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Link ghi chú bảo mật của bạn đã sẵn sàng:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdUrl}
                className="flex-1 rounded-xl border border-line bg-canvas p-2.5 text-xs font-mono text-ink focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-xs font-semibold text-black hover:bg-teal/90 transition shadow-sm"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[0.68rem] text-subtle font-mono">
              <span>{burnAfterRead ? "Tự hủy: Có" : "Tự hủy: Không"}</span>
              <span>{isProtected ? "Khóa mật khẩu: Có" : "Khóa mật khẩu: Không"}</span>
              <a href={createdUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                <Eye className="h-3 w-3" /> Mở xem thử
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Recent Notes History */}
      {recentNotes.length > 0 && (
        <div className="card p-6 border border-line bg-surface/60">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Ghi chú gần đây của bạn trên trình duyệt này
          </h3>
          <div className="space-y-2">
            {recentNotes.map((n) => (
              <div key={n.slug} className="flex items-center justify-between text-xs py-2 border-b border-line/40 last:border-none">
                <span className="font-medium text-ink">{n.title}</span>
                <span className="font-mono text-subtle">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
