import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { absoluteUrl, articleSchema, breadcrumbSchema, buildMetadata, JsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { articles, getArticle, getRelatedArticles } from "@/data/articles";
import { extractToc } from "@/lib/markdown";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { Markdown } from "@/components/content/Markdown";
import { TableOfContents } from "@/components/content/TableOfContents";
import { ShareLinks } from "@/components/content/ShareLinks";
import { ArticleCard } from "@/components/content/ArticleCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(locale) || !article) return {};
  return buildMetadata({
    locale,
    path: `academy/${slug}`,
    title: article.title[locale],
    description: article.excerpt[locale],
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const article = getArticle(slug);
  if (!article) notFound();

  const t = getT(locale, "academy");
  const common = getT(locale, "common");
  const index = articles.findIndex((item) => item.slug === article.slug) + 1;
  const toc = extractToc(article.body[locale]);
  const related = getRelatedArticles(article, 3);
  const url = absoluteUrl(`/${locale}/academy/${article.slug}`);
  const categoryHref = localePath(locale, `/academy/category/${article.category}`);

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
          <div className="container-page relative py-12 sm:py-16">
            <Breadcrumbs
              items={[
                { label: "Mythos", href: localePath(locale) },
                { label: t("title"), href: localePath(locale, "/academy") },
                { label: article.title[locale] },
              ]}
            />
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={categoryHref}>
                  <Badge tone="accent">{t(`categories.${article.category}`)}</Badge>
                </Link>
                {article.featured ? <Badge tone="outline">{common("featured")}</Badge> : null}
              </div>
              <h1 className="display-title mt-5 text-3xl leading-[1.08] sm:text-5xl">{article.title[locale]}</h1>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{article.excerpt[locale]}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {article.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(article.publishedAt, locale)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {article.readingMinutes} {common("minutesRead")}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="container-page py-10 sm:py-14">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <Artwork seed={index} label={t(`categories.${article.category}`)} className="aspect-[16/9] w-full rounded-2xl border border-line" />
              <div className="mt-10">
                <Markdown content={article.body[locale]} />
              </div>

              {article.sources && article.sources.length > 0 ? (
                <section className="mt-12 rounded-xl border border-line bg-surface p-6">
                  <h2 className="font-display text-base font-semibold text-ink">{t("sources")}</h2>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {article.sources.map((source) => (
                      <li key={source} className="break-words">
                        {source.startsWith("http") ? (
                          <a href={source} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
                            {source}
                          </a>
                        ) : (
                          source
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <Link href={localePath(locale, "/academy")} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink">
                  <ArrowLeft className="h-4 w-4" /> {t("backToAcademy")}
                </Link>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <TableOfContents items={toc} locale={locale} />
              <ShareLinks url={url} title={article.title[locale]} locale={locale} />
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("disclaimerTitle")}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{t("disclaimer")}</p>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-line bg-surface/50">
          <div className="container-page py-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{t("related")}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <ArticleCard key={item.slug} article={item} locale={locale} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={articleSchema({
          title: article.title[locale],
          description: article.excerpt[locale],
          url,
          image: `${absoluteUrl("")}/brand/og-default.png`,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: article.author,
          locale,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Mythos", url: absoluteUrl(`/${locale}`) },
          { name: t("title"), url: absoluteUrl(`/${locale}/academy`) },
          { name: article.title[locale], url },
        ])}
      />
    </>
  );
}
