import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { AccountSettingsClient } from "@/components/settings/AccountSettingsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return buildMetadata({
    locale,
    path: "settings",
    title: "Cài đặt Tài khoản · Myso",
    description: "Quản lý và tùy chỉnh thông tin cá nhân, ảnh đại diện, ảnh bìa và quyền riêng tư trên Myso.",
    noIndex: true,
  });
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;

  return <AccountSettingsClient locale={locale} />;
}
