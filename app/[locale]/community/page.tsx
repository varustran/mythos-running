import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowRight, Award, ClipboardList, ShieldCheck, UserRound } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHero, EmptyState } from "@/components/content/PageHero";
import { createClient, getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/Button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "community");
  return buildMetadata({ locale, path: "community", title: t("title"), description: t("desc") });
}

type ProfileRow = { id: string; full_name: string | null; role: string };

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "community");
  const profile = await getCurrentProfile();

  let profiles: ProfileRow[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase.from("community_members").select("id, full_name, role").order("created_at", { ascending: true }).limit(10);
      profiles = (data as ProfileRow[] | null) ?? [];
    }
  }

  const features = [
    { icon: UserRound, title: t("features.profile"), desc: t("features.profileDesc") },
    { icon: Award, title: t("features.records"), desc: t("features.recordsDesc") },
    { icon: ClipboardList, title: t("features.logs"), desc: t("features.logsDesc") },
    { icon: Activity, title: t("features.challenges"), desc: t("features.challengesDesc") },
  ];

  return (
    <>
      <PageHero eyebrow="Myso Community" title={t("title")} description={t("desc")} image="/images/community-1.jpg">
        <Link href={localePath(locale, profile ? "/admin" : "/login")} className={buttonStyles("primary", "md")}>
          {profile ? t("features.profile") : t("loginCta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHero>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-elevated text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-4 font-display text-base font-semibold text-ink">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{t("leaderboard")}</h2>
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                {t("sampleNotice").split(".")[0].slice(0, 26)}
              </span>
            </div>
            {profiles.length === 0 ? (
              <div className="mt-5">
                <EmptyState title={t("leaderboard")} description={t("sampleNotice")} />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-line">
                      {[t("rank"), t("runner"), t("distance"), t("time")].map((head) => (
                        <th key={head} className="pb-2 pr-4 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((item, index) => (
                      <tr key={item.id} className="border-b border-line/70 last:border-0">
                        <td className="py-2.5 pr-4 font-mono text-muted">{index + 1}</td>
                        <td className="py-2.5 pr-4 text-ink">{item.full_name || "Myso Runner"}</td>
                        <td className="py-2.5 pr-4 text-muted">—</td>
                        <td className="py-2.5 pr-4 text-muted">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card flex flex-col justify-between p-6">
            <div>
              <ShieldCheck className="h-5 w-5 text-teal" />
              <h2 className="mt-4 font-display text-lg font-semibold text-ink">{t("features.profile")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("features.profileDesc")}</p>
            </div>
            <Link href={localePath(locale, profile ? "/admin" : "/login")} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              {profile ? t("features.profile") : t("loginCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
