"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Flame, ArrowLeft, Copy, Check, ShieldAlert, Clock } from "lucide-react";
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

    // Attempt to load note
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setNoteData(data.note);
          if (!data.note.is_password_protected) {
            setUnlocked(true);
          }
        } else {
          // Fallback demo for previewing
          setNoteData({
            title: "Tài liệu chia sẻ bảo mật",
            content: "Nội dung ghi chú được mã hóa và bảo mật trên nền tảng Myso Notes.",
            isProtected: false,
            burnAfterRead: false,
          });
          setUnlocked(true);
        }
      } catch {
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
      } else {
        setNoteData(data.note);
        setUnlocked(true);
      }
    } catch {
      setErrorMsg("Không thể xác thực mật khẩu.");
    }
  };

  const copyContent = () => {
    if (!noteData) return;
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
            Đang giải mã nội dung ghi chú...
          </div>
        ) : errorMsg && !noteData ? (
          <div className="text-center py-10">
            <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
            <h3 className="mt-3 font-display text-lg font-bold text-ink">Ghi chú không khả dụng</h3>
            <p className="mt-1 text-xs text-muted">Ghi chú có thể đã bị xóa, tự hủy hoặc hết hạn lưu trữ.</p>
          </div>
        ) : !unlocked ? (
          <form onSubmit={handleUnlock} className="text-center py-8 max-w-sm mx-auto space-y-4">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Ghi chú này đã được khóa</h3>
            <p className="text-xs text-muted">Vui lòng nhập mật mã bảo vệ để mở khóa nội dung.</p>

            {errorMsg && <p className="text-xs text-red-400 font-mono">{errorMsg}</p>}

            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mã mở khóa..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink focus:border-accent focus:outline-none transition text-center"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-accent py-2.5 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition shadow-md"
            >
              Mở Khóa Ghi Chú
            </button>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
              <h2 className="font-display text-xl font-bold text-ink">{noteData?.title}</h2>
              <button
                onClick={copyContent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono text-ink hover:border-accent transition"
              >
                {copied ? <Check className="h-3 w-3 text-teal" /> : <Copy className="h-3 w-3" />}
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4 text-sm font-mono text-ink whitespace-pre-wrap leading-relaxed">
              {noteData?.content}
            </div>

            {noteData?.burnAfterRead && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-400 font-mono">
                <Flame className="h-3.5 w-3.5 shrink-0" />
                <span>Ghi chú này đã tự động kích hoạt chế độ tự hủy sau khi đọc.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
