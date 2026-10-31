import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero, EmptyState } from "@/components/content/PageHero";
import { ToolCard } from "@/components/content/ToolCard";
import { tools, toolCategories } from "@/lib/tools/catalog";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "tools");
  return buildMetadata({ locale, path: "tools", title: t("title"), description: t("desc") });
}

export default async function ToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const { category } = await searchParams;
  const t = getT(locale, "tools");
  const active = category && toolCategories.includes(category as (typeof toolCategories)[number]) ? category : undefined;
  const filtered = active ? tools.filter((tool) => tool.category === active) : tools;

  return (
    <>
      <PageHero eyebrow="Myso Tools" title={t("title")} description={t("desc")} />
      <div className="container-page py-12 sm:py-16">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <Link
            href={localePath(locale, "/tools")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
              !active ? "border-accent bg-accent text-white dark:text-[#04101F]" : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
            )}
          >
            {t("allTools")}
          </Link>
          {toolCategories.map((item) => {
            const key = `category${item.charAt(0).toUpperCase()}${item.slice(1)}`;
            return (
              <Link
                key={item}
                href={`${localePath(locale, "/tools")}?category=${item}`}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition",
                  active === item
                    ? "border-accent bg-accent text-white dark:text-[#04101F]"
                    : "border-line bg-surface text-muted hover:border-accent/60 hover:text-ink",
                )}
              >
                {t(key)}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t("invalid")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} locale={locale} />
            ))}
          </div>
        )}

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-subtle">{t("formulaNote")}</p>
      </div>
    </>
  );
}
