import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  FlaskConical,
  Users,
  Activity,
  HeartPulse,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Artwork } from "@/components/brand/Artwork";
import { ArticleCard } from "@/components/content/ArticleCard";
import { EventCard } from "@/components/content/EventCard";
import { RouteCard } from "@/components/content/RouteCard";
import { ToolCard } from "@/components/content/ToolCard";
import { getFeaturedArticles } from "@/data/articles";
import { getUpcomingEvents } from "@/data/events";
import { routes } from "@/data/routes";
import { tools } from "@/lib/tools/catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "home");
  return buildMetadata({
    locale,
    title: `${t("heroTitle")} ${t("heroHighlight")}`,
    description: t("heroDesc"),
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "home");
  const common = getT(locale, "common");
  const toolsT = getT(locale, "tools");
  const featuredArticles = getFeaturedArticles(3);
  const upcoming = getUpcomingEvents(3);
  const featuredRoutes = routes.filter((route) => route.featured).slice(0, 2);
  const featuredTools = tools.filter((tool) =>
    ["pace-calculator", "race-time-predictor", "heart-rate-zones", "training-plan", "split-calculator", "age-grading"].includes(tool.slug),
  );

  const pillars = [
    { icon: BookOpen, title: t("pillar1Title"), desc: t("pillar1Desc") },
    { icon: Calculator, title: t("pillar2Title"), desc: t("pillar2Desc") },
    { icon: Users, title: t("pillar3Title"), desc: t("pillar3Desc") },
    { icon: FlaskConical, title: t("pillar4Title"), desc: t("pillar4Desc") },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-[-10%] h-[420px] w-[420px] glow-orb" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow mb-5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
              {t("eyebrow")}
            </p>
            <h1 className="display-title text-[2.7rem] leading-[0.98] sm:text-6xl lg:text-[4.5rem]">
              {t("heroTitle")}
              <span className="mt-1 block text-accent">{t("heroHighlight")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{t("heroDesc")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={localePath(locale, "/tools")} size="lg">
                {t("heroCtaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/academy")} variant="secondary" size="lg">
                {t("heroCtaSecondary")}
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                { value: tools.length, label: t("heroStatTools") },
                { value: 5, label: t("heroStatArticles") },
                { value: 4, label: t("heroStatLangs") },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold text-ink sm:text-3xl">{stat.value}</dt>
                  <dd className="mt-1 text-[0.7rem] leading-snug text-subtle">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="card relative overflow-hidden p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-subtle">Mythos / session 042</span>
                <Badge tone="outline">{common("sampleData")}</Badge>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight text-ink">12.4<span className="ml-1 text-lg text-subtle">km</span></p>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">Huong River · 05:32</p>
                </div>
                <span className="rounded-full bg-teal/10 px-2.5 py-1 font-mono text-[0.62rem] text-teal">5:12 /km</span>
              </div>
              <div className="relative mt-4 overflow-hidden rounded-xl border border-line bg-elevated/70">
                <Artwork seed={2} className="aspect-[16/9] w-full opacity-90" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-canvas/80 px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted backdrop-blur">
                  <MapPin className="h-3 w-3" /> Hue
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Activity, label: common("pace"), value: "5:12" },
                  { icon: HeartPulse, label: common("heartRate"), value: "148" },
                  { icon: ChevronRight, label: common("cadence"), value: "176" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-line bg-surface px-3 py-2.5">
                      <Icon className="h-3.5 w-3.5 text-accent" />
                      <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">{item.label}</p>
                      <p className="mt-0.5 font-display text-base font-semibold text-ink">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { zone: "Z2", pct: 62, color: "bg-teal" },
                  { zone: "Z3", pct: 26, color: "bg-accent" },
                  { zone: "Z4", pct: 12, color: "bg-amber-400" },
                ].map((zone) => (
                  <div key={zone.zone} className="flex items-center gap-3">
                    <span className="w-6 font-mono text-[0.6rem] text-subtle">{zone.zone}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                      <div className={`h-full rounded-full ${zone.color}`} style={{ width: `${zone.pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[0.6rem] text-subtle">{zone.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full border border-line sm:block" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-line bg-surface/60 py-3">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.28em] text-subtle">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className="flex items-center gap-8">
              {t("marquee")}
              <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow="01 — Mythos" title={t("pillarsTitle")} description={t("pillarsDesc")} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-elevated text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[0.6rem] text-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="02 — Tools"
            title={t("toolsTitle")}
            description={t("toolsDesc")}
            action={{ label: toolsT("allTools"), href: localePath(locale, "/tools") }}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="03 — Academy"
          title={t("academyTitle")}
          description={t("academyDesc")}
          action={{ label: common("viewAll"), href: localePath(locale, "/academy") }}
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {featuredArticles[0] ? <ArticleCard article={featuredArticles[0]} locale={locale} index={1} large /> : null}
          <div className="grid gap-4">
            {featuredArticles.slice(1).map((article, index) => (
              <ArticleCard key={article.slug} article={article} locale={locale} index={index + 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="04 — Events"
              title={t("eventsTitle")}
              description={t("eventsDesc")}
              action={{ label: common("viewAll"), href: localePath(locale, "/events") }}
            />
            <div className="mt-8 space-y-3">
              {upcoming.map((event) => (
                <EventCard key={event.slug} event={event} locale={locale} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="05 — Routes"
              title={t("routesTitle")}
              description={t("routesDesc")}
              action={{ label: common("viewAll"), href: localePath(locale, "/routes") }}
            />
            <div className="mt-8 grid gap-4">
              {featuredRoutes.map((route, index) => (
                <RouteCard key={route.slug} route={route} locale={locale} index={index + 2} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card relative overflow-hidden p-7 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 glow-orb" aria-hidden="true" />
            <Users className="h-6 w-6 text-accent" />
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t("communityTitle")}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{t("communityDesc")}</p>
            <Link href={localePath(locale, "/community")} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              {t("communityCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="card relative overflow-hidden p-7 sm:p-9">
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal/10 blur-2xl" aria-hidden="true" />
            <FlaskConical className="h-6 w-6 text-teal" />
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t("labsTitle")}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{t("labsDesc")}</p>
            <Link href={localePath(locale, "/labs")} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal">
              {t("labsCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
