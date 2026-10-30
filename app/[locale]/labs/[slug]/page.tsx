import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { getLabProject, labProjects } from "@/data/labs";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";

export const dynamicParams = false;

export function generateStaticParams() {
  return labProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getLabProject(slug);
  if (!isLocale(locale) || !project) return {};
  return buildMetadata({
    locale,
    path: `labs/${slug}`,
    title: project.title[locale],
    description: project.summary[locale],
  });
}

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const project = getLabProject(slug);
  if (!project) notFound();
  const t = getT(locale, "labs");
  const common = getT(locale, "common");
  const statusTone = { active: "teal", published: "accent", planned: "outline" } as const;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
        <div className="container-page relative py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: "Mythos", href: localePath(locale) },
              { label: t("title"), href: localePath(locale, "/labs") },
              { label: project.title[locale] },
            ]}
          />
          <Badge tone={statusTone[project.status]}>{t(`status${project.status.charAt(0).toUpperCase()}${project.status.slice(1)}`)}</Badge>
          <h1 className="display-title mt-4 max-w-3xl text-3xl leading-[1.06] sm:text-5xl">{project.title[locale]}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{project.summary[locale]}</p>
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-subtle">
            {common("updated")} Â· {formatDate(project.updatedAt, locale)}
          </p>
        </div>
      </section>

      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-ink">{t("title")}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{project.description[locale]}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-ink">{t("methodology")}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{project.methodology[locale]}</p>
          </div>
        </div>

        <p className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">{t("evidenceNote")}</p>

        <div className="mt-8">
          <Link href={localePath(locale, "/labs")} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent">
            <ArrowLeft className="h-4 w-4" /> {t("title")}
          </Link>
        </div>
      </div>
    </>
  );
}
