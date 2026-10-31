import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, MapPin, Users } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { absoluteUrl, buildMetadata, JsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { events, getEvent } from "@/data/events";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { buttonStyles } from "@/components/ui/Button";

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = getEvent(slug);
  if (!isLocale(locale) || !event) return {};
  return buildMetadata({
    locale,
    path: `events/${slug}`,
    title: event.title[locale],
    description: event.description[locale],
    noIndex: event.sample,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const event = getEvent(slug);
  if (!event) notFound();
  const t = getT(locale, "events");
  const common = getT(locale, "common");
  const url = absoluteUrl(`/${locale}/events/${event.slug}`);
  const date = new Date(event.date);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Myso", href: localePath(locale) },
              { label: t("title"), href: localePath(locale, "/events") },
              { label: event.title[locale] },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{event.city}</Badge>
            {event.sample ? <Badge tone="outline">{common("sampleData")}</Badge> : null}
          </div>
          <h1 className="display-title mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">{event.title[locale]}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{event.description[locale]}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {event.officialUrl ? (
              <a href={event.officialUrl} target="_blank" rel="noreferrer" className={buttonStyles("primary", "md")}>
                {t("register")} <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="rounded-full border border-line bg-surface px-4 py-2 text-xs text-subtle">{t("sampleNotice")}</span>
            )}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, label: t("date"), value: formatDate(date, locale) },
            { icon: MapPin, label: t("location"), value: event.location[locale] },
            { icon: Users, label: t("organizer"), value: event.organizer },
            { icon: ExternalLink, label: t("distances"), value: event.distances.map((d) => `${d} km`).join(" · ") },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-5">
                <Icon className="h-4 w-4 text-accent" />
                <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{item.label}</p>
                <p className="mt-1 text-sm leading-snug text-ink">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 text-xs leading-relaxed text-muted">
          {t("sampleNotice")}
        </div>

        <div className="mt-8">
          <Link href={localePath(locale, "/events")} className="text-sm text-muted transition hover:text-accent">
            ← {t("title")}
          </Link>
        </div>
      </div>

      {!event.sample ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: event.title[locale],
            description: event.description[locale],
            startDate: event.date,
            endDate: event.endDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            url,
            location: {
              "@type": "Place",
              name: event.location[locale],
              address: { "@type": "PostalAddress", addressLocality: event.city, addressCountry: "VN" },
            },
            organizer: { "@type": "Organization", name: event.organizer },
            image: absoluteUrl("/brand/og-default.png"),
          }}
        />
      ) : null}
    </>
  );
}
