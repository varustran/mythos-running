import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { MeetLobbyClient } from "@/components/meet/MeetLobbyClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return buildMetadata({
    locale,
    path: "meet",
    title: "MysoMeet — Phòng Họp Trực Tuyến",
    description: "Hội nghị truyền hình trực tuyến MysoMeet chất lượng cao với âm thanh, camera mượt mà và bộ lọc thời gian thực.",
  });
}

export default async function MeetLobbyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  return <MeetLobbyClient locale={locale} />;
}
