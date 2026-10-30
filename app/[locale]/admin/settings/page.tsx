import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");

  const rows = [
    { label: "Site name", value: siteConfig.name },
    { label: t("defaultLocale"), value: siteConfig.locale },
    { label: "Site URL", value: siteConfig.url },
    { label: "Supabase", value: isSupabaseConfigured() ? t("active") : t("supabaseMissing") },
    { label: "GitHub", value: siteConfig.github },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold text-ink">{t("settings")}</h1>

      <div className="card p-6">
        <dl className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-2 last:border-0">
              <dt className="text-xs text-muted">{row.label}</dt>
              <dd className="max-w-full break-all text-right font-mono text-xs text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-semibold text-ink">{t("supabaseMissing")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("supabaseMissingDesc")}</p>
        <code className="mt-4 block overflow-x-auto rounded-lg border border-line bg-canvas px-4 py-3 font-mono text-xs text-accent">
          supabase/migrations/0001_init.sql
        </code>
      </div>

      <p className="text-xs leading-relaxed text-subtle">{t("seedContentNote")}</p>
    </div>
  );
}
