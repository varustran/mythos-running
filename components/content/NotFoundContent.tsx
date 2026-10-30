"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { isLocale, localePath, defaultLocale } from "@/lib/i18n/settings";

export function NotFoundContent() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] || "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const { t } = useTranslation("errors");

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
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
