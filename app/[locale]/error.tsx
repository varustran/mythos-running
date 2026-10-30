"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="card max-w-lg p-8 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-amber-500">500</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t("serverError")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("notFoundDesc")}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 dark:text-[#04101F]"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
