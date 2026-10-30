import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/content/PageHero";
import { ContactForm } from "@/components/content/ContactForm";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "legal");
  return buildMetadata({ locale, path: "contact", title: t("contactTitle"), description: t("contactDesc") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "legal");
  const common = getT(locale, "common");

  return (
    <>
      <PageHero eyebrow="Myso Contact" title={t("contactTitle")} description={t("contactDesc")} />
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <ContactForm locale={locale} />
          <aside className="space-y-4">
            <div className="card p-6">
              <MapPin className="h-5 w-5 text-teal" />
              <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t("address")}</p>
              <p className="mt-2 text-sm text-ink">Myso Open Network · Decentralized Global</p>
              <p className="mt-4 text-xs leading-relaxed text-muted">{t("contactNote")}</p>
            </div>
            <div className="card p-6">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">Social</p>
              <ul className="mt-3 space-y-2">
                {siteConfig.social.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noreferrer" className="text-sm text-muted transition hover:text-accent">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="px-1 text-[0.68rem] leading-relaxed text-subtle">
              <Link href={localePath(locale, "/privacy")} className="underline underline-offset-4 hover:text-accent">
                {t("privacyTitle")}
              </Link>{" "}
              · {common("brand")}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
