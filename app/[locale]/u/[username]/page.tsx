import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { UserWallClient } from "@/components/profile/UserWallClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}): Promise<Metadata> {
  const { locale, username } = await params;
  if (!isLocale(locale)) return {};

  const cleanHandle = decodeURIComponent(username).replace(/^@/, "");

  return buildMetadata({
    locale,
    path: `u/${cleanHandle}`,
    title: `@${cleanHandle} · Hồ sơ thành viên Myso`,
    description: `Khám phá bài viết, bình luận và chia sẻ từ @${cleanHandle} trên nền tảng cộng đồng Myso.`,
  });
}

export default async function UserProfileWallPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: rawLocale, username: rawUsername } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  return <UserWallClient username={username} locale={locale} />;
}
