import Link from "next/link";
import type { Locale } from "@/lib/i18n/settings";
import { localePath } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/content/PageHero";
import { Markdown } from "@/components/content/Markdown";
import { legalDocs, type LegalDocKey } from "@/data/legal";

const titleKeys: Record<LegalDocKey, string> = {
  privacy: "privacyTitle",
  terms: "termsTitle",
  "editorial-policy": "editorialTitle",
  disclaimer: "disclaimerTitle",
};

export function LegalPage({ locale, doc }: { locale: Locale; doc: LegalDocKey }) {
  const t = getT(locale, "legal");
  const data = legalDocs[doc];
  const title = t(titleKeys[doc]);

  return (
    <>
      <PageHero eyebrow="Myso Legal" title={title} description={`${t("lastUpdated")}: ${formatDate(data.updatedAt, locale)}`} />
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Markdown content={data.body[locale]} />
          <div className="mt-10 rounded-xl border border-line bg-surface p-6">
            <p className="font-display text-base font-semibold text-ink">{t("contactTitle")}</p>
            <p className="mt-2 text-sm text-muted">{t("address")}</p>
            <Link href={localePath(locale, "/contact")} className="mt-4 inline-flex text-sm font-medium text-accent">
              {t("contactTitle")} →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
