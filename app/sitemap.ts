import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { locales } from "@/lib/i18n/settings";

const base = siteConfig.url;

function entry(path: string, priority = 0.7, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") {
  const languages = Object.fromEntries(locales.map((locale) => [locale, `${base}/${locale}${path}`]));
  return {
    url: `${base}/vi${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages: { ...languages, "x-default": `${base}/vi${path}` } },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/wiki", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/chat", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/notes", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/legal/standards", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticPaths.map((item) => entry(item.path, item.priority, item.changeFrequency));
}
