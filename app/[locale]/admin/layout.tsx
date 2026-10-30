import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, FlaskConical, LayoutDashboard, MessageSquare, Route as RouteIcon, Settings, ShieldAlert, Users } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { buttonStyles } from "@/components/ui/Button";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "admin");
  const common = getT(locale, "common");

  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="card max-w-xl p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t("supabaseMissing")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("supabaseMissingDesc")}</p>
          <Link href={localePath(locale)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <ArrowLeft className="h-4 w-4" /> {common("home")}
          </Link>
        </div>
      </div>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect(localePath(locale, "/login"));
  if (profile.role === "reader") {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="card max-w-lg p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t("noAccess")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("signInRequired")}</p>
          <Link href={localePath(locale)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <ArrowLeft className="h-4 w-4" /> {common("home")}
          </Link>
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/articles", label: t("articles"), icon: BookOpen },
    { href: "/admin/events", label: t("events"), icon: CalendarDays },
    { href: "/admin/routes", label: t("routes"), icon: RouteIcon },
    { href: "/admin/messages", label: t("messages"), icon: MessageSquare },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <div className="mb-4 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-accent" />
            <span className="font-display text-sm font-semibold text-ink">Mythos Admin</span>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={localePath(locale, item.href)}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-ink"
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 hidden border-t border-line pt-4 lg:block">
            <Link href={localePath(locale)} className="flex items-center gap-1.5 px-3 text-xs text-subtle transition hover:text-accent">
              <ArrowLeft className="h-3.5 w-3.5" /> {t("backToSite")}
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-subtle">{t("dashboard")}</p>
              <p className="mt-1 text-sm text-ink">{profile.fullName || profile.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                {t(`role${profile.role.charAt(0).toUpperCase()}${profile.role.slice(1)}`)}
              </span>
              <SignOutButton locale={locale} />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
