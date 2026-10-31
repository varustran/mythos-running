import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero, EmptyState } from "@/components/content/PageHero";
import { GearCard } from "@/components/content/GearCard";
import { gearReviews } from "@/data/gear";
import { cn } from "@/lib/utils";

const categories = ["shoes", "watches", "apparel", "hydration", "recovery", "accessories"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "gear");
  return buildMetadata({ locale, path: "gear", title: t("title"), description: t("desc") });
}

export default async function GearPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category } = await searchParams;
  const t = getT(locale, "gear");
  const active = category && categories.includes(category as (typeof categories)[number]) ? category : undefined;
  const filtered = active ? gearReviews.filter((review) => review.category === active) : gearReviews;

  return (
    <>
      <PageHero eyebrow="Myso Gear" title={t("title")} description={t("desc")} image="/images/gear-shoes.jpg" />
      <div className="container-page py-12 sm:py-16">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <Link
            href={localePath(locale, "/gear")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
              !active ? "border-accent bg-accent text-white dark:text-[#04101F]" : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
            )}
          >
            {getT(locale, "common")("all")}
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              href={`${localePath(locale, "/gear")}?category=${item}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
                active === item
                  ? "border-accent bg-accent text-white dark:text-[#04101F]"
                  : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
              )}
            >
              {t(`categories.${item}`)}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t("noReviews")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((review, index) => (
              <GearCard key={review.slug} review={review} locale={locale} index={index + 1} />
            ))}
          </div>
        )}

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-subtle">{t("disclosure")}</p>
      </div>
    </>
  );
}
