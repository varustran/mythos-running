import Link from "next/link";
import { Compass, Home, LogIn, Sparkles } from "lucide-react";

const translations = [
  { locale: "vi", label: "Trang không tồn tại", desc: "Liên kết có thể bị hỏng, đã bị gỡ bỏ hoặc bạn không có quyền truy cập." },
  { locale: "en", label: "Page not found", desc: "The link may be broken, removed, or you don't have access permissions." },
  { locale: "zh-CN", label: "页面未找到", desc: "链接可能已损坏、被移除或您没有访问权限。" },
  { locale: "ja", label: "ページが見つかりません", desc: "リンクが無効か、削除されたか、アクセス権限がありません。" },
];

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-xl text-center">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface/80 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            ERROR 404
          </span>
        </div>

        {/* Large 404 Typography */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-ink leading-none">
          4<span className="text-accent">0</span>4
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
          Không tìm thấy trang yêu cầu
        </h2>

        {/* Multilingual message cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {translations.map((item) => (
            <div
              key={item.locale}
              className="p-3 rounded-xl border border-line/60 bg-surface/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink mb-1">
                <span className="font-mono uppercase text-[0.65rem] text-accent px-1.5 py-0.5 rounded bg-accent/10">
                  {item.locale}
                </span>
                <span>{item.label}</span>
              </div>
              <p className="text-[0.75rem] text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold transition hover:opacity-95 shadow-md shadow-accent/20 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Về Bảng Tin Myso
          </Link>
          <Link
            href="/vi/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-accent/40 active:scale-95"
          >
            <LogIn className="h-4 w-4 text-muted" />
            Đăng Nhập / Đăng Ký
          </Link>
          <Link
            href="/vi/community"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-xs font-semibold text-muted hover:text-ink transition active:scale-95"
          >
            <Compass className="h-4 w-4" />
            Khám phá
          </Link>
        </div>

        <p className="mt-10 font-mono text-[0.7rem] text-subtle">
          MYSO ECOSYSTEM · A SPACE FOR EVERY IDEA
        </p>
      </div>
    </div>
  );
}
