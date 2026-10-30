export const locales = ["vi", "en", "zh-CN", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const localeNames: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
  "zh-CN": "简体中文",
  ja: "日本語",
};

export const localeShort: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
  "zh-CN": "中",
  ja: "JA",
};

export const htmlLang: Record<Locale, string> = {
  vi: "vi",
  en: "en",
  "zh-CN": "zh-CN",
  ja: "ja",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
