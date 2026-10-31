import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";

export default async function LegacyProfileRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: rawLocale, username: rawUsername } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  redirect(localePath(locale, `/u/${username}`));
}
