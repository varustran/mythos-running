import { vi } from "./vi";
import { en } from "./en";
import { zhCN } from "./zh-CN";
import { ja } from "./ja";
import type { Locale } from "./settings";

export const dictionaries = {
  vi,
  en,
  "zh-CN": zhCN,
  ja,
} as const;

export const resources = {
  vi: { ...vi },
  en: { ...en },
  "zh-CN": { ...zhCN },
  ja: { ...ja },
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

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
