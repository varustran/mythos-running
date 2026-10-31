export const locales = ["en", "vi", "zh-CN", "ja", "fr", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const localeNames: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-CN": "简体中文",
  ja: "日本語",
  fr: "Français",
  de: "Deutsch",
};

export const localeShort: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
  "zh-CN": "ZH",
  ja: "JA",
  fr: "FR",
  de: "DE",
};

export const htmlLang: Record<Locale, string> = {
  vi: "vi",
  en: "en",
  "zh-CN": "zh-CN",
  ja: "ja",
  fr: "fr",
  de: "de",
};

export function isLocale(value: string): value is Locale {
  if (value === "zh") return true;
  return (locales as readonly string[]).includes(value);
}

export function normalizeLocale(value: string): Locale {
  if (value === "zh") return "zh-CN";
  if (isLocale(value)) return value;
  return defaultLocale;
}

export function localePath(locale: Locale | string, path = ""): string {
  const norm = normalizeLocale(locale);
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${norm}/${clean}` : `/${norm}`;
}
