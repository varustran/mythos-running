import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero, EmptyState } from "@/components/content/PageHero";
import { RouteCard } from "@/components/content/RouteCard";
import { routes } from "@/data/routes";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "routes");
  return buildMetadata({ locale, path: "routes", title: t("title"), description: t("desc") });
}

export default async function RoutesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "routes");

  return (
    <>
      <PageHero eyebrow="Hue Routes" title={t("title")} description={t("desc")} />
      <div className="container-page py-12 sm:py-16">
        {routes.length === 0 ? (
          <EmptyState title={t("noRoutes")} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route, index) => (
                <RouteCard key={route.slug} route={route} locale={locale} index={index + 1} />
              ))}
            </div>
            <p className="mt-8 max-w-3xl rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
              {t("sampleNotice")}
            </p>
          </>
        )}
      </div>
    </>
  );
}
