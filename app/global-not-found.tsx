import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Page not found · Mythos Running",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

const links = [
  { locale: "vi", label: "Trang chủ" },
  { locale: "en", label: "Home" },
  { locale: "zh-CN", label: "首页" },
  { locale: "ja", label: "ホーム" },
];

export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body className="bg-canvas text-ink antialiased">
        <main className="container-page flex min-h-screen items-center justify-center py-16">
          <div className="max-w-xl text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent">404</p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Page not found</h1>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p>Trang không tồn tại.</p>
              <p>页面未找到。</p>
              <p>ページが見つかりません。</p>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {links.map((link) => (
                <a
                  key={link.locale}
                  href={`/${link.locale}`}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-ink transition hover:border-accent/60 hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
