import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, Minus } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { gearReviews, getGearReview } from "@/data/gear";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { Markdown } from "@/components/content/Markdown";
import { GearCard } from "@/components/content/GearCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return gearReviews.map((review) => ({ slug: review.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = getGearReview(slug);
  if (!isLocale(locale) || !review) return {};
  return buildMetadata({
    locale,
    path: `gear/${slug}`,
    title: review.title[locale],
    description: review.excerpt[locale],
    type: "article",
    publishedTime: review.publishedAt,
  });
}

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const review = getGearReview(slug);
  if (!review) notFound();
  const t = getT(locale, "gear");
  const common = getT(locale, "common");
  const index = gearReviews.findIndex((item) => item.slug === review.slug) + 1;
  const related = gearReviews.filter((item) => item.slug !== review.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Mythos", href: localePath(locale) },
              { label: t("title"), href: localePath(locale, "/gear") },
              { label: review.title[locale] },
            ]}
          />
          <Badge tone="accent">{t(`categories.${review.category}`)}</Badge>
          <h1 className="display-title mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">{review.title[locale]}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{review.excerpt[locale]}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-subtle">
            <span>{formatDate(review.publishedAt, locale)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {review.readingMinutes} {common("minutesRead")}
            </span>
          </div>
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <Artwork seed={index + 3} label={t(`categories.${review.category}`)} className="aspect-[16/9] w-full rounded-2xl border border-line" />
            <div className="mt-8">
              <Markdown content={review.body[locale]} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-accent/25 bg-accent-soft/50 p-5">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("verdict")}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">{review.verdict[locale]}</p>
            </div>

            <div className="card p-5">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("specs")}</p>
              <dl className="mt-3 space-y-2">
                {review.specs.map((spec) => (
                  <div key={spec.label} className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-0">
                    <dt className="text-xs text-muted">{spec.label}</dt>
                    <dd className="text-right font-mono text-xs text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card p-5">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("pros")}</p>
              <ul className="mt-2 space-y-1.5">
                {review.pros[locale].map((pro) => (
                  <li key={pro} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" /> {pro}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("cons")}</p>
              <ul className="mt-2 space-y-1.5">
                {review.cons[locale].map((con) => (
                  <li key={con} className="flex gap-2 text-xs leading-relaxed text-muted">
                    <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {con}
                  </li>
                ))}
              </ul>
            </div>

            <p className="px-1 text-[0.68rem] leading-relaxed text-subtle">{t("disclosure")}</p>
          </aside>
        </div>

        <div className="mt-10">
          <Link href={localePath(locale, "/gear")} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent">
            <ArrowLeft className="h-4 w-4" /> {t("title")}
          </Link>
        </div>

        {related.length > 0 ? (
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold text-ink">{common("related")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <GearCard key={item.slug} review={item} locale={locale} index={i + 5} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
