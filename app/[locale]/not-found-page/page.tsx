import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { Sparkles, Home, LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Trang không tồn tại · Myso",
  robots: { index: false, follow: false },
};

export default async function NotFoundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "errors");

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-xl text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface/80 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            ERROR 404
          </span>
        </div>

        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-ink leading-none">
          4<span className="text-accent">0</span>4
        </h1>

        <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
          {t("notFoundTitle") || "Không tìm thấy nội dung yêu cầu"}
        </h2>

        <p className="mt-3 text-sm text-muted max-w-md mx-auto">
          {t("notFoundDesc") || "Liên kết có thể đã bị gỡ bỏ, hỏng hoặc bạn không có quyền truy cập."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localePath(locale)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold transition hover:opacity-95 shadow-md shadow-accent/20 active:scale-95"
          >
            <Home className="h-4 w-4" />
            {t("goHome") || "Về Trang Chủ"}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line bg-surface hover:bg-canvas text-xs font-semibold text-ink transition hover:border-accent/40 active:scale-95"
          >
            <LogIn className="h-4 w-4 text-muted" />
            Đăng Nhập / Đăng Ký
          </Link>
        </div>
      </div>
    </div>
  );
}
