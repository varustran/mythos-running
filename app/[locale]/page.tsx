import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { SocialFeedClient } from "@/components/social/SocialFeedClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const titles = {
    vi: "Myso — Mạng Xã Hội Tri Thức, Khám Phá & Giao Tiếp Mã Hóa",
    en: "Myso — Open Social Network, Knowledge Discovery & Encrypted Chat",
    "zh-CN": "Myso — 开放社交网络、知识发现与加密通讯",
    ja: "Myso — オープンソーシャルネットワーク、知識発見、暗号化チャット",
  };

  const descriptions = {
    vi: "Mạng xã hội mở thế hệ mới: Thảo luận thời gian thực, bách khoa tri thức mở có kiểm chứng, ghi chú bảo mật và trò chuyện mã hóa đầu cuối.",
    en: "Next-generation open social network: real-time feed, peer-reviewed encyclopedia, secure pastebin, and end-to-end encrypted messaging.",
    "zh-CN": "下一代开放式社交网络：实时动态、经同行评审的百科全书、安全便签及端到端加密即时通讯。",
    ja: "次世代オープンソーシャルネットワーク：リアルタイムフィード、査読付き百科事典、安全なメモ、エンドツーエンド暗号化メッセージング。",
  };

  return buildMetadata({
    locale,
    path: "",
    title: titles[locale as Locale] || titles.en,
    description: descriptions[locale as Locale] || descriptions.en,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return <SocialFeedClient locale={locale} />;
}
