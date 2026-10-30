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
  Sparkles,
  Play,
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
                <Artwork seed={1} image="/images/hero-running.jpg" className="aspect-[16/9] w-full" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-canvas/80 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink backdrop-blur">
                  <MapPin className="h-3 w-3 text-accent" /> Hue, Vietnam
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

      {/* 06 — Mythos Original Game Showcase */}
      <section className="border-b border-line bg-[#03060E] py-16 sm:py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/game-hero.jpg"
            alt="Mythos: The Last Route"
            className="h-full w-full object-cover opacity-25 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03060E] via-[#03060E]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03060E] via-[#03060E]/90 to-transparent" />
        </div>

        <div className="container-page relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 font-mono text-xs font-medium text-teal">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} />
              MYTHOS ORIGINAL GAME · CHƠI TRÊN WEB
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {locale === "vi" ? "Mythos: Dấu Chân Cuối Cùng" : "Mythos: The Last Route"}
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A7B4C7]">
              {locale === "vi"
                ? "Tựa game phiêu lưu tường thuật 8 chương lấy bối cảnh Cố Đô Huế. Chạy qua những cung đường ẩn giấu, thu thập mảnh ký ức và giải mã bí mật trong đêm."
                : "An 8-chapter narrative running adventure through mysterious phantom avenues in ancient Hue. Run, collect memory shards, and uncover the city's lost routes."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={localePath(locale, "/game/play")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-accent px-6 py-3 text-sm font-semibold text-black hover:opacity-95 transition shadow-lg shadow-teal/20"
              >
                <Play className="h-4 w-4 fill-current" />
                {locale === "vi" ? "Chơi Ngay (Miễn Phí)" : "Play Online (Free)"}
              </Link>
              <Link
                href={localePath(locale, "/game")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:border-teal transition backdrop-blur"
              >
                {locale === "vi" ? "Xem 8 Chương Cốt Truyện" : "Explore 8 Chapters"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/10] w-full max-w-md lg:max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="/images/game-chapter-1.jpg"
              alt="The Last Route Screenshot"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-wider text-teal">Chapter 1 Preview</p>
                <p className="font-display text-base font-semibold text-white">Hào Thành Lúc Nửa Đêm · Midnight Citadel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface/30">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="06 — Community Moments"
            title={locale === "vi" ? "Khoảnh khắc Mythos Running tại Huế" : locale === "zh-CN" ? "Mythos 在顺化的跑步瞬间" : locale === "ja" ? "フエでのMythosランニングの瞬間" : "Mythos Running Moments in Hue"}
            description={locale === "vi" ? "Những bước chạy thực tế qua từng con đường cổ kính, bờ sông Hương và các cung đồi thơ mộng của Cố đô." : locale === "zh-CN" ? "沿着古城街道、香江河畔与顺化秀美山丘的真实奔跑。" : locale === "ja" ? "古都の街並み、フォーン川沿い、そして緑豊かな丘陵を駆け抜ける実際のランニングシーン。" : "Real community strides through ancient citadel avenues, Huong riverbanks, and scenic hills."}
            action={{ label: common("viewAll"), href: localePath(locale, "/community") }}
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { img: "/images/hero-running.jpg", label: "Huong River Sunrise", caption: "Sông Hương" },
              { img: "/images/route-kinh-thanh.jpg", label: "Citadel Loop", caption: "Kinh Thành" },
              { img: "/images/route-vong-canh.jpg", label: "Vong Canh Pine Trail", caption: "Đồi Vọng Cảnh" },
              { img: "/images/community-1.jpg", label: "Mythos Runners", caption: "CLB Mythos" },
            ].map((pic, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-xl border border-line bg-surface aspect-[4/3]">
                <img
                  src={pic.img}
                  alt={pic.label}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-display text-xs font-semibold text-ink drop-shadow-sm">{pic.caption}</span>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-accent backdrop-blur bg-canvas/80 px-2 py-0.5 rounded-full">{pic.label}</span>
                </div>
              </div>
            ))}
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
