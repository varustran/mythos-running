import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { PageHero } from "@/components/content/PageHero";
import { Badge } from "@/components/ui/Badge";
import { labProjects } from "@/data/labs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "labs");
  return buildMetadata({ locale, path: "labs", title: t("title"), description: t("desc") });
}

export default async function LabsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "labs");
  const common = getT(locale, "common");
  const statusTone = { active: "teal", published: "accent", planned: "outline" } as const;

  return (
    <>
      <PageHero eyebrow="Myso Labs" title={t("title")} description={t("desc")} />
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {labProjects.map((project) => (
            <Link key={project.slug} href={localePath(locale, `/labs/${project.slug}`)} className="group card card-hover flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-elevated text-teal">
                  <FlaskConical className="h-4 w-4" />
                </span>
                <Badge tone={statusTone[project.status]}>{t(`status${project.status.charAt(0).toUpperCase()}${project.status.slice(1)}`)}</Badge>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-ink transition group-hover:text-accent">
                {project.title[locale]}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary[locale]}</p>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-subtle">
                  {common("updated")} · {formatDate(project.updatedAt, locale)}
                </span>
                <ArrowUpRight className="h-4 w-4 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 max-w-3xl rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          {t("evidenceNote")}
        </p>
      </div>
    </>
  );
}
