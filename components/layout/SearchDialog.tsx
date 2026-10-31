"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, CornerDownLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { articles } from "@/data/articles";
import { events } from "@/data/events";
import { routes } from "@/data/routes";
import { gearReviews } from "@/data/gear";
import { labProjects } from "@/data/labs";
import { tools } from "@/lib/tools/catalog";
import type { Locale } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  description: string;
  href: string;
  group: "academy" | "tools" | "events" | "routes" | "gear" | "labs";
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

export function SearchDialog({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<Item[]>(() => {
    return [
      ...articles.map((article) => ({
        title: article.title[locale],
        description: article.excerpt[locale],
        href: `/${locale}/academy/${article.slug}`,
        group: "academy" as const,
      })),
      ...tools.map((tool) => ({
        title: t(`tools:items.${tool.slug}.name`),
        description: t(`tools:items.${tool.slug}.desc`),
        href: `/${locale}/tools/${tool.slug}`,
        group: "tools" as const,
      })),
      ...events.map((event) => ({
        title: event.title[locale],
        description: event.location[locale],
        href: `/${locale}/events/${event.slug}`,
        group: "events" as const,
      })),
      ...routes.map((route) => ({
        title: route.name[locale],
        description: route.description[locale],
        href: `/${locale}/routes/${route.slug}`,
        group: "routes" as const,
      })),
      ...gearReviews.map((review) => ({
        title: review.title[locale],
        description: review.excerpt[locale],
        href: `/${locale}/gear/${review.slug}`,
        group: "gear" as const,
      })),
      ...labProjects.map((project) => ({
        title: project.title[locale],
        description: project.summary[locale],
        href: `/${locale}/labs`,
        group: "labs" as const,
      })),
    ];
  }, [locale, t]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return index.slice(0, 7);
    return index
      .filter((item) => normalize(`${item.title} ${item.description}`).includes(q))
      .slice(0, 9);
  }, [index, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const groupLabels: Record<Item["group"], string> = {
    academy: t("nav:academy"),
    tools: t("nav:tools"),
    events: t("nav:events"),
    routes: t("nav:routes"),
    gear: t("nav:gear"),
    labs: t("nav:labs"),
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-[#03070d]/70 px-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t("common:search")}>
      <button className="absolute inset-0 cursor-default" aria-label={t("common:close")} onClick={onClose} tabIndex={-1} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 text-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("common:searchPlaceholder")}
            className="h-14 flex-1 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-subtle"
            aria-label={t("common:search")}
          />
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-subtle transition hover:bg-elevated hover:text-ink"
            aria-label={t("common:close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">{t("common:noResults")}</p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((item) => (
                <li key={`${item.group}-${item.href}-${item.title}`}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-elevated"
                  >
                    <span className="mt-0.5 rounded-md border border-line px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                      {groupLabels[item.group]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink group-hover:text-accent">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{item.description}</span>
                    </span>
                    <CornerDownLeft className="mt-1 h-3.5 w-3.5 shrink-0 text-subtle opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-subtle">
          <span>Myso</span>
          <span className={cn("hidden sm:inline")}>ESC</span>
        </div>
      </div>
    </div>
  );
}
