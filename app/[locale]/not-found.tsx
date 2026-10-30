import Link from "next/link";

const messages = [
  { locale: "vi", label: "Trang không tồn tại", home: "Về trang chủ" },
  { locale: "en", label: "Page not found", home: "Go home" },
  { locale: "zh-CN", label: "页面未找到", home: "返回首页" },
  { locale: "ja", label: "ページが見つかりません", home: "ホームへ" },
];

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-xl text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Page not found
        </h1>
        <div className="mt-4 space-y-1 text-sm text-muted">
          {messages.map((message) => (
            <p key={message.locale}>{message.label}</p>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {messages.map((message) => (
            <Link
              key={message.locale}
              href={`/${message.locale}`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-ink transition hover:border-accent/60 hover:text-accent"
            >
              {message.home}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
