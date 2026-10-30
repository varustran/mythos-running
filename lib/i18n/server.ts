import { createInstance, type i18n } from "i18next";
import { dictionaries, namespaces } from "./resources";
import { defaultLocale, type Locale } from "./settings";

const instances = new Map<Locale, i18n>();

function createI18n(locale: Locale): i18n {
  const instance = createInstance();
  instance.init({
    lng: locale,
    fallbackLng: defaultLocale,
    resources: Object.fromEntries(
      Object.entries(dictionaries).map(([lng, dict]) => [
        lng,
        Object.fromEntries(namespaces.map((ns) => [ns, (dict as Record<string, unknown>)[ns] ?? {}])),
      ]),
    ),
    ns: [...namespaces],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    initImmediate: false,
    returnNull: false,
  });
  return instance;
}

export function getI18n(locale: Locale): i18n {
  let instance = instances.get(locale);
  if (!instance) {
    instance = createI18n(locale);
    instances.set(locale, instance);
  }
  return instance;
}

export function getT(locale: Locale, namespace: string = "common") {
  return getI18n(locale).getFixedT(locale, namespace);
}
