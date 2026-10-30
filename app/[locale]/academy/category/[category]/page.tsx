import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/content/PageHero";
import { AcademyBrowser } from "@/components/content/AcademyBrowser";
import { articles } from "@/data/articles";
import type { ArticleCategory } from "@/data/types";

const validCategories: ArticleCategory[] = ["beginner", "training", "physiology", "nutrition", "recovery", "gear", "racing"];

export const dynamicParams = false;

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale) || !validCategories.includes(category as ArticleCategory)) return {};
  const t = getT(locale, "academy");
  return buildMetadata({
    locale,
    path: `academy/category/${category}`,
    title: `${t(`categories.${category}`)} — ${t("title")}`,
    description: t("desc"),
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale: raw, category } = await params;
  if (!isLocale(raw) || !validCategories.includes(category as ArticleCategory)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "academy");

  return (
    <>
      <PageHero
        eyebrow={t("title")}
        title={t(`categories.${category}`)}
        description={t("desc")}
      />
      <AcademyBrowser articles={articles} locale={locale} activeCategory={category} />
    </>
  );
}
