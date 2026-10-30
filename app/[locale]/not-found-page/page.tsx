import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: false },
};

export default async function NotFoundPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "errors");

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-xl text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("notFoundDesc")}</p>
        <Link
          href={localePath(locale)}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 dark:text-[#04101F]"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
