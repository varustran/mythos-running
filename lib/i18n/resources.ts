import { vi } from "./vi";
import { en } from "./en";
import { zhCN } from "./zh-CN";
import { ja } from "./ja";
import { fr } from "./fr";
import { de } from "./de";
import type { Locale } from "./settings";

export const dictionaries = {
  vi,
  en,
  zh: zhCN,
  "zh-CN": zhCN,
  ja,
  fr,
  de,
} as const;

export const resources = {
  vi: { ...vi },
  en: { ...en },
  zh: { ...zhCN },
  "zh-CN": { ...zhCN },
  ja: { ...ja },
  fr: { ...fr },
  de: { ...de },
} as const;

export const namespaces = [
  "common",
  "nav",
  "home",
  "tools",
  "academy",
  "events",
  "routes",
  "gear",
  "community",
  "labs",
  "admin",
  "auth",
  "legal",
  "errors",
] as const;

export type Namespace = (typeof namespaces)[number];

export function getDictionary(locale: Locale | string) {
  if (locale === "zh-CN") return dictionaries["zh-CN"];
  return dictionaries[locale as Locale] || dictionaries.vi;
}
