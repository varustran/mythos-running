import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { ProfileViewClient } from "@/components/profile/ProfileViewClient";

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
    path: `profile/${cleanHandle}`,
    title: `@${cleanHandle} · Hồ sơ thành viên Myso`,
    description: `Khám phá bài viết, ý kiến và chia sẻ từ @${cleanHandle} trên nền tảng cộng đồng Myso.`,
  });
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: rawLocale, username: rawUsername } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  return <ProfileViewClient username={username} locale={locale} />;
}
