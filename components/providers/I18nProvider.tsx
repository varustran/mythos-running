"use client";

import { useMemo } from "react";
import i18next, { type i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { dictionaries, namespaces } from "@/lib/i18n/resources";
import type { Locale } from "@/lib/i18n/settings";

function build(locale: Locale): i18n {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "vi",
    resources: Object.fromEntries(
      Object.entries(dictionaries).map(([lng, dict]) => [
        lng,
        Object.fromEntries(namespaces.map((ns) => [ns, (dict as Record<string, unknown>)[ns] ?? {}])),
      ]),
    ),
    ns: [...namespaces],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });
  return instance;
}

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const instance = useMemo(() => build(locale), [locale]);

  return (
    <I18nextProvider i18n={instance} key={locale}>
      {children}
    </I18nextProvider>
  );
}
