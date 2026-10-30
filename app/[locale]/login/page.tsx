import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getT(locale, "auth");
  return buildMetadata({ locale, path: "login", title: t("signInTitle"), description: t("signInDesc"), noIndex: true });
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getT(locale, "auth");
  const common = getT(locale, "common");

  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="card max-w-lg p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t("notConfigured")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("notConfiguredDesc")}</p>
          <Link href={localePath(locale)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <ArrowLeft className="h-4 w-4" /> {common("home")}
          </Link>
        </div>
      </div>
    );
  }

  const profile = await getCurrentProfile();
  if (profile) redirect(localePath(locale, "/admin"));

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <LoginForm locale={locale} />
        <Link href={localePath(locale)} className="mt-6 inline-flex items-center gap-1.5 text-xs text-subtle transition hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> {common("home")}
        </Link>
      </div>
    </div>
  );
}
