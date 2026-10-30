import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/content/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { aboutContent } from "@/data/about";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "legal");
  return buildMetadata({ locale, path: "about", title: t("aboutTitle"), description: aboutContent[locale].intro });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "legal");
  const c = aboutContent[locale];

  return (
    <>
      <PageHero eyebrow={t("aboutEyebrow")} title={t("aboutTitle")} description={c.intro} />

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <p className="eyebrow">{t("storyEyebrow")}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{c.storyTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">{c.story}</p>
          </section>
          <section className="card p-6">
            <MapPin className="h-5 w-5 text-teal" />
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">{c.hueTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.hue}</p>
          </section>
        </div>

        <section className="mt-14">
          <p className="eyebrow">{t("principlesEyebrow")}</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{c.principlesTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {c.principles.map((principle, index) => (
              <div key={principle.title} className="card p-5">
                <div className="flex items-center justify-between">
                  <Compass className="h-4 w-4 text-accent" />
                  <span className="font-mono text-[0.6rem] text-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{principle.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 card relative overflow-hidden p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 glow-orb" aria-hidden="true" />
          <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{c.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{c.ctaDesc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={localePath(locale, "/academy")}>
              {c.cta} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <Link href={localePath(locale, "/contact")} className="inline-flex items-center gap-1.5 px-2 py-2.5 text-sm font-medium text-muted transition hover:text-accent">
              {t("contactTitle")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
