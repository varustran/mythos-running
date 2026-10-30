"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { locales, localeNames, type Locale } from "@/lib/i18n/settings";

export function LanguageSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation("common");

  function change(next: string) {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = next;
    const query = window.location.search;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${segments.join("/")}${query}`);
  }

  return (
    <label className="relative inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs text-muted transition focus-within:border-accent/60 hover:border-accent/60">
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => change(event.target.value)}
        aria-label={t("language")}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium text-ink outline-none"
      >
        {locales.map((item) => (
          <option key={item} value={item} className="bg-surface text-ink">
            {compact ? item.toUpperCase() : localeNames[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
