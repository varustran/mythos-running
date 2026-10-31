import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — Trang không tồn tại · Myso",
  description: "Trang bạn yêu cầu không tồn tại hoặc đã được gỡ bỏ khỏi mạng xã hội Myso.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body className="bg-canvas text-ink antialiased">
        <main className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="relative w-full max-w-xl text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-surface/80 backdrop-blur-md mb-6">
              <span className="font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                ERROR 404
              </span>
            </div>

            <h1 className="font-display text-7xl sm:text-8xl font-black tracking-tighter text-ink leading-none">
              4<span className="text-accent">0</span>4
            </h1>

            <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Không tìm thấy trang yêu cầu
            </h2>

            <p className="mt-2 text-sm text-muted">
              Địa chỉ truy cập không tồn tại hoặc bạn không có quyền truy cập vào nội dung này.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/vi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white dark:text-[#04101F] text-xs font-bold transition hover:opacity-95 shadow-md shadow-accent/20"
              >
                Về Trang Chủ Myso
              </a>
              <a
                href="/vi/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-line bg-surface text-xs font-semibold text-ink transition hover:border-accent/40"
              >
                Đăng Nhập / Đăng Ký
              </a>
            </div>

            <p className="mt-12 font-mono text-[0.7rem] text-subtle">
              MYSO ECOSYSTEM · A SPACE FOR EVERY IDEA
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
