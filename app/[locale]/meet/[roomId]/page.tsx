import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { MeetRoomClient } from "@/components/meet/MeetRoomClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; roomId: string }>;
}): Promise<Metadata> {
  const { locale, roomId } = await params;
  if (!isLocale(locale)) return {};

  return buildMetadata({
    locale,
    path: `meet/${roomId}`,
    title: `Phòng Họp ${roomId} · MysoMeet E2EE`,
    description: "Phòng họp trực tuyến bảo mật cao cấp, chống quay màn hình và che video khi chuyển tab.",
  });
}

export default async function MeetRoomPage({
  params,
}: {
  params: Promise<{ locale: string; roomId: string }>;
}) {
  const { locale: rawLocale, roomId: rawRoomId } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const roomId = decodeURIComponent(rawRoomId);

  return <MeetRoomClient roomId={roomId} locale={locale} />;
}
