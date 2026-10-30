import Link from "next/link";
import { Github, ArrowUpRight } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { localePath, type Locale } from "@/lib/i18n/settings";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getT(locale, "common");
  const nav = getT(locale, "nav");
  const legal = getT(locale, "legal");

  const explore = [
    { label: nav("wiki"), href: "/wiki" },
    { label: nav("blog"), href: "/blog" },
    { label: nav("notes"), href: "/notes" },
    { label: nav("tools"), href: "/tools" },
    { label: nav("arcade"), href: "/arcade" },
  ];
  const company = [
    { label: nav("monetization"), href: "/monetization" },
    { label: nav("community"), href: "/community" },
    { label: nav("about"), href: "/about" },
    { label: nav("contact"), href: "/contact" },
  ];
  const legalLinks = [
    { label: legal("privacyTitle"), href: "/privacy" },
    { label: legal("termsTitle"), href: "/terms" },
    { label: legal("editorialTitle"), href: "/editorial-policy" },
    { label: legal("disclaimerTitle"), href: "/disclaimer" },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm">
          <Logo href={localePath(locale)} />
          <p className="mt-5 text-sm leading-relaxed text-muted">{t("footerNote")}</p>
          <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">
            {t("builtIn")}
          </p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-medium text-ink">{t("newsletterTitle")}</p>
            <p className="mb-3 text-xs leading-relaxed text-muted">{t("newsletterDesc")}</p>
            <NewsletterForm locale={locale} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterGroup title={t("footerExplore")} links={explore.map((link) => ({ ...link, href: localePath(locale, link.href) }))} />
          <FooterGroup title={t("footerCompany")} links={company.map((link) => ({ ...link, href: localePath(locale, link.href) }))} />
          <FooterGroup title={t("footerLegal")} links={legalLinks.map((link) => ({ ...link, href: localePath(locale, link.href) }))} />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em]">VI · EN · 中文 · 日本語</span>
            <Link href={siteConfig.github} className="inline-flex items-center gap-1 transition hover:text-ink" target="_blank" rel="noreferrer">
              <Github className="h-3.5 w-3.5" />
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-[0.62rem] font-medium uppercase tracking-[0.2em] text-subtle">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
