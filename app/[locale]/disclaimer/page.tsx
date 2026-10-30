import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "legal");
  return buildMetadata({ locale, path: "disclaimer", title: t("disclaimerTitle"), description: t("aboutTitle") });
}

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale as Locale} doc="disclaimer" />;
}
