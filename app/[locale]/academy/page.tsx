import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/content/PageHero";
import { AcademyBrowser } from "@/components/content/AcademyBrowser";
import { RunnerQuiz } from "@/components/tools/RunnerQuiz";
import { articles } from "@/data/articles";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "academy");
  return buildMetadata({ locale, path: "academy", title: t("title"), description: t("desc") });
}

export default async function AcademyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { q } = await searchParams;
  const t = getT(locale, "academy");

  return (
    <>
      <PageHero eyebrow="Myso Academy" title={t("title")} description={t("desc")} image="/images/academy-training.jpg" />
      <AcademyBrowser articles={articles} locale={locale} query={q} />
      <section className="container-page pb-20 pt-8 max-w-3xl">
        <RunnerQuiz locale={locale} />
      </section>
    </>
  );
}
