import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sigma } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { getTool, tools } from "@/lib/tools/catalog";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ToolWorkbench } from "@/components/tools/ToolWorkbench";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getTool(slug);
  if (!isLocale(locale) || !tool) return {};
  const t = getT(locale, "tools");
  return buildMetadata({
    locale,
    path: `tools/${slug}`,
    title: t(`items.${slug}.name`),
    description: t(`items.${slug}.desc`),
  });
}

const noteKeys = { formula: "formulaNote", estimate: "estimateNote", medical: "medicalNote" } as const;

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const tool = getTool(slug);
  if (!tool) notFound();

  const t = getT(locale, "tools");
  const related = tools.filter((item) => item.category === tool.category && item.slug !== tool.slug).slice(0, 4);
  const categoryKey = `category${tool.category.charAt(0).toUpperCase()}${tool.category.slice(1)}`;
  const name = t(`items.${slug}.name`);
  const desc = t(`items.${slug}.desc`);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Myso", href: localePath(locale) },
              { label: t("title"), href: localePath(locale, "/tools") },
              { label: name },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{t(categoryKey)}</Badge>
            <Badge tone="outline">{tool.note === "medical" ? t("medicalNote").split(".")[0] : tool.note === "estimate" ? t("estimateNote").split(".")[0] : t("formulaNote").split(".")[0]}</Badge>
          </div>
          <h1 className="display-title mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">{name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{desc}</p>
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <ToolWorkbench slug={slug} locale={locale} />

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="card p-6">
            <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">
              <Sigma className="h-3.5 w-3.5" /> {t("formula")}
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg border border-line bg-canvas px-4 py-3 font-mono text-sm text-accent">
              {tool.formula}
            </code>
            <p className="mt-3 text-xs leading-relaxed text-muted">{t(noteKeys[tool.note])}</p>
          </div>

          <aside className="card p-6">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{t(categoryKey)}</p>
            <div className="mt-3 space-y-1">
              {related.length > 0 ? (
                related.map((item) => (
                  <Link
                    key={item.slug}
                    href={localePath(locale, `/tools/${item.slug}`)}
                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink"
                  >
                    <span>{t(`items.${item.slug}.name`)}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-subtle transition group-hover:text-accent" />
                  </Link>
                ))
              ) : (
                <Link href={localePath(locale, "/tools")} className="text-sm text-accent">
                  {t("allTools")}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name,
          description: desc,
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          inLanguage: locale,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
