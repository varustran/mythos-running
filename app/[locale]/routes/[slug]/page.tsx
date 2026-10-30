import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Footprints, Lightbulb, MapPin, Mountain, Route as RouteIcon, ShieldAlert, Star, Sunrise } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { absoluteUrl, buildMetadata, JsonLd } from "@/lib/seo";
import { getRoute, routes } from "@/data/routes";
import { Artwork } from "@/components/brand/Artwork";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { RouteCard } from "@/components/content/RouteCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = getRoute(slug);
  if (!isLocale(locale) || !route) return {};
  return buildMetadata({
    locale,
    path: `routes/${slug}`,
    title: route.name[locale],
    description: route.description[locale],
  });
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const route = getRoute(slug);
  if (!route) notFound();
  const t = getT(locale, "routes");
  const common = getT(locale, "common");
  const index = routes.findIndex((item) => item.slug === route.slug) + 1;
  const url = absoluteUrl(`/${locale}/routes/${route.slug}`);

  const stats = [
    { icon: RouteIcon, label: t("distance"), value: `${route.distanceKm} km` },
    { icon: Mountain, label: t("elevation"), value: `${route.elevationM} m` },
    { icon: Footprints, label: t("surface"), value: common(route.surface) },
    { icon: ShieldAlert, label: t("difficulty"), value: common(route.difficulty) },
    { icon: Lightbulb, label: t("lighting"), value: route.lighting[locale] },
    { icon: Star, label: t("rating"), value: `${route.rating.toFixed(1)} / 5 Â· ${route.reviews} ${t("reviews")}` },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Mythos", href: localePath(locale) },
              { label: t("title"), href: localePath(locale, "/routes") },
              { label: route.name[locale] },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">{common(route.difficulty)}</Badge>
            <Badge tone="outline">{common(route.surface)}</Badge>
          </div>
          <h1 className="display-title mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">{route.name[locale]}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{route.description[locale]}</p>
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <Artwork seed={index + 2} label={t("title")} className="aspect-[21/9] w-full rounded-2xl border border-line" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card flex items-start gap-3 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-elevated text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">{stat.label}</p>
                  <p className="mt-1 text-sm text-ink">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="card p-6">
            <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
              <MapPin className="h-3.5 w-3.5" /> {t("startPoint")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{route.startPoint[locale]}</p>
          </div>
          <div className="card p-6">
            <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
              <Sunrise className="h-3.5 w-3.5" /> {t("bestTime")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{route.bestTime[locale]}</p>
          </div>
          <div className="card p-6">
            <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
              <ShieldAlert className="h-3.5 w-3.5" /> {t("safetyNotes")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{route.safety[locale]}</p>
          </div>
        </div>

        <p className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">{t("sampleNotice")}</p>

        <div className="mt-8">
          <Link href={localePath(locale, "/routes")} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent">
            <ArrowLeft className="h-4 w-4" /> {t("title")}
          </Link>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink">{common("related")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes
              .filter((item) => item.slug !== route.slug)
              .slice(0, 3)
              .map((item, i) => (
                <RouteCard key={item.slug} route={item} locale={locale} index={i + 4} />
              ))}
          </div>
        </div>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: route.name[locale],
          description: route.description[locale],
          url,
          image: absoluteUrl("/brand/og-default.png"),
          address: { "@type": "PostalAddress", addressLocality: "Hue", addressCountry: "VN" },
          touristType: "Runners",
        }}
      />
    </>
  );
}
