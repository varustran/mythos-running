import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, FileText, Lock, Flame, Shield } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { NotesClient } from "@/components/notes/NotesClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Notes — Ghi Chú Nhanh, Bảo Mật & Tự Hủy",
    en: "Myso Notes — Instant Secure Pastebin & Self-Destruct Notes",
    "zh-CN": "Myso 便签 — 即时安全便签与自动销毁",
    ja: "Myso ノート — セキュアなインスタント共有と自動消去ノート",
  };

  return buildMetadata({
    locale,
    path: "notes",
    title: titles[locale as Locale] || titles.en,
    description: "Create instant shareable encrypted notes with password protection and self-destruct capabilities without requiring an account.",
  });
}

export default async function NotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <span className="eyebrow mb-2">INSTANT PASTEBIN & SECRET SHARING</span>
        <h1 className="display-title text-3xl sm:text-5xl font-bold">Myso Notes</h1>
        <p className="mt-3 text-sm text-muted">
          Tạo và chia sẻ ghi chú nhanh, mã nguồn hoặc mật khẩu tạm thời. Tùy chọn khóa mật mã, cài đặt thời hạn hoặc tự hủy sau khi đọc.
        </p>
      </div>

      <NotesClient locale={locale} />
    </div>
  );
}
