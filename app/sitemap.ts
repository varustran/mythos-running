import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { locales } from "@/lib/i18n/settings";
import { articles } from "@/data/articles";
import { events } from "@/data/events";
import { routes } from "@/data/routes";
import { gearReviews } from "@/data/gear";
import { labProjects } from "@/data/labs";
import { tools } from "@/lib/tools/catalog";

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
    { path: "/academy", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/tools", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/events", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/routes", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/gear", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/labs", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return [
    ...staticPaths.map((item) => entry(item.path, item.priority, item.changeFrequency)),
    ...articles.map((article) => entry(`/academy/${article.slug}`, 0.8)),
    ...tools.map((tool) => entry(`/tools/${tool.slug}`, 0.7)),
    ...routes.map((route) => entry(`/routes/${route.slug}`, 0.6, "monthly")),
    ...gearReviews.map((review) => entry(`/gear/${review.slug}`, 0.6)),
    ...labProjects.map((project) => entry(`/labs/${project.slug}`, 0.5)),
    ...events.filter((event) => !event.sample).map((event) => entry(`/events/${event.slug}`, 0.6, "weekly")),
  ];
}
