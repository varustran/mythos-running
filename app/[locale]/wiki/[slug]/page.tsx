import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { buildMetadata } from "@/lib/seo";
import { curatedWikiArticles, type WikiArticleItem } from "@/lib/wiki/wikipedia";
import { WikiArticleViewer } from "@/components/wiki/WikiArticleViewer";

export async function generateStaticParams() {
  const locales = ["vi", "en", "zh-CN", "ja"];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const art of curatedWikiArticles) {
      params.push({ locale, slug: art.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = curatedWikiArticles.find((a) => a.slug === slug);
  if (!article) return {};

  return buildMetadata({
    locale,
    path: `wiki/${slug}`,
    title: `${article.title} — Myso Wiki`,
    description: article.summary,
    image: article.thumbnail,
  });
}

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const article = curatedWikiArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  return <WikiArticleViewer initialArticle={article} locale={locale} />;
}
