import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero, EmptyState } from "@/components/content/PageHero";
import { EventCard } from "@/components/content/EventCard";
import { events } from "@/data/events";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "events");
  return buildMetadata({ locale, path: "events", title: t("title"), description: t("desc") });
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "events");
  const now = Date.now();
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter((event) => new Date(event.date).getTime() >= now);
  const past = sorted.filter((event) => new Date(event.date).getTime() < now).reverse();

  return (
    <>
      <PageHero eyebrow="Mythos Events" title={t("title")} description={t("desc")} />
      <div className="container-page py-12 sm:py-16">
        <p className="mb-8 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-muted">
          {t("sampleNotice")}
        </p>

        <h2 className="font-display text-xl font-semibold text-ink">{t("upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="mt-5">
            <EmptyState title={t("noEvents")} />
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} locale={locale} />
            ))}
          </div>
        )}

        {past.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink">{t("past")}</h2>
            <div className="mt-5 grid gap-3 opacity-80">
              {past.map((event) => (
                <EventCard key={event.slug} event={event} locale={locale} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
