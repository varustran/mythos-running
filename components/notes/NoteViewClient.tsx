"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Flame, ArrowLeft, Copy, Check, ShieldAlert, Sparkles, KeyRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";

export function NoteViewClient({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const slug = searchParams.get("id");

  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noteData, setNoteData] = useState<{
    title: string;
    content: string;
    isProtected: boolean;
    burnAfterRead: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setErrorMsg("Không tìm thấy mã định danh ghi chú.");
      return;
    }

    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${slug}`);
        const data = await res.json();

        if (res.ok && data.note) {
          const isProt = Boolean(data.note.is_password_protected || data.note.isProtected);
          const burn = Boolean(data.note.burn_after_read || data.note.burnAfterRead);

          setNoteData({
            title: data.note.title || "Ghi chú không tiêu đề",
            content: data.note.content || "",
            isProtected: isProt,
            burnAfterRead: burn,
          });

          if (!isProt) {
            setUnlocked(true);
          }
        } else {
          setErrorMsg(data.error || "Ghi chú không tồn tại, đã tự hủy hoặc hết hạn lưu trữ.");
        }
      } catch (err: any) {
        setErrorMsg("Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [slug]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/notes/${slug}?password=${encodeURIComponent(passwordInput)}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Mật khẩu không chính xác.");
      } else if (data.note) {
        setNoteData({
          title: data.note.title || "Ghi chú không tiêu đề",
          content: data.note.content || "",
          isProtected: Boolean(data.note.is_password_protected),
          burnAfterRead: Boolean(data.note.burn_after_read),
        });
        setUnlocked(true);
      }
    } catch {
      setErrorMsg("Không thể xác thực mật khẩu.");
    }
  };

  const copyContent = () => {
    if (!noteData?.content) return;
    navigator.clipboard.writeText(noteData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={localePath(locale, "/notes")}
        className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-ink transition"
      >
        <ArrowLeft className="h-4 w-4 text-accent" />
        <span>{locale === "vi" ? "Tạo ghi chú mới" : "Create New Note"}</span>
      </Link>

      <div className="card p-6 sm:p-8 border border-line bg-surface shadow-2xl">
        {loading ? (
          <div className="text-center py-12 font-mono text-xs text-muted">
            Đang giải mã và tải nội dung ghi chú...
          </div>
        ) : errorMsg && !noteData ? (
          <div className="text-center py-12 space-y-3">
            <ShieldAlert className="mx-auto h-12 w-12 text-rose-500/80" />
            <h3 className="font-display text-xl font-bold text-ink">Ghi chú không khả dụng</h3>
            <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
              {errorMsg}
            </p>
            <div className="pt-4">
              <Link
                href={localePath(locale, "/notes")}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Tạo ghi chú mới ngay</span>
              </Link>
            </div>
          </div>
        ) : !unlocked ? (
          <form onSubmit={handleUnlock} className="text-center py-8 max-w-sm mx-auto space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent border border-accent/30">
              <KeyRound className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Ghi chú đã được khóa mật mã</h3>
            <p className="text-xs text-muted">Vui lòng nhập mật mã của người gửi để mở khóa và giải mã nội dung.</p>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono">
                {errorMsg}
              </div>
            )}

            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mật mã bảo vệ..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition text-center"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-accent py-3 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-md"
            >
              Mở Khóa Ghi Chú
            </button>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
              <div>
                <span className="font-mono text-[0.65rem] text-accent uppercase font-bold tracking-wider">
                  MYSO SECURE PASTEBIN
                </span>
                <h2 className="font-display text-xl font-bold text-ink mt-0.5">
                  {noteData?.title || "Ghi chú không tiêu đề"}
                </h2>
              </div>
              <button
                onClick={copyContent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-mono text-ink hover:border-accent transition shadow-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
              </button>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-5 text-sm font-mono text-ink whitespace-pre-wrap leading-relaxed min-h-[140px] select-all">
              {noteData?.content}
            </div>

            {noteData?.burnAfterRead && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono">
                <Flame className="h-4 w-4 shrink-0 text-rose-500" />
                <span>
                  Chế độ tự hủy (Burn-after-reading) đã kích hoạt: Ghi chú này đã được xóa vĩnh viễn khỏi máy chủ sau khi bạn xem xong.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
