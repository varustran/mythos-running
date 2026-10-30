import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { EncryptedChatClient } from "@/components/chat/EncryptedChatClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso Trò Chuyện Mã Hóa — Tin Nhắn Trực Tiếp & Riêng Tư",
    en: "Myso Encrypted Chat — Private Direct Messaging",
    "zh-CN": "Myso 加密聊天 — 私密即时消息",
    ja: "Myso 暗号化チャット — プライベートダイレクトメッセージ",
  };

  return buildMetadata({
    locale,
    path: "chat",
    title: titles[locale as Locale] || titles.en,
    description: "End-to-end encrypted direct messaging network with zero plain-text retention, media sharing, and legal compliance.",
  });
}

export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return <EncryptedChatClient locale={locale} />;
}
