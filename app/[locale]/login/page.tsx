import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert, CheckCircle2, User, Flame, Shield } from "lucide-react";
import { isLocale, localePath, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { getCurrentProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignOutButton } from "@/components/auth/SignOutButton";

const ROOT_ADMIN_EMAIL = "chuitv1907@gmail.com";

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
        <div className="card max-w-lg p-8 text-center border border-line bg-surface rounded-3xl shadow-sm">
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
  const isRootAdmin = profile?.email?.toLowerCase() === ROOT_ADMIN_EMAIL;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-lg">
        {profile ? (
          /* User is already authenticated */
          <div className="card p-6 sm:p-8 border border-line bg-surface rounded-3xl shadow-xl space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal/40 bg-teal/10 text-teal text-xs font-mono font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>ĐÃ ĐĂNG NHẬP / AUTHENTICATED</span>
            </div>

            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent border border-accent/30 mx-auto">
              <User className="h-8 w-8" />
            </div>

            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
                {profile.fullName || "Thành viên Myso"}
              </h1>
              <p className="font-mono text-xs text-muted mt-1">{profile.email}</p>
              <span className="inline-block mt-2 font-mono text-[0.68rem] uppercase tracking-wider text-accent border border-accent/40 bg-accent/10 px-2.5 py-0.5 rounded-full font-bold">
                Vai trò: {profile.role}
              </span>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href={localePath(locale, "/")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs sm:text-sm font-bold text-white dark:text-[#04101F] transition hover:opacity-95 shadow-md shadow-accent/20 active:scale-95"
              >
                <Flame className="h-4 w-4" />
                Vào Bảng Tin Ngay
              </Link>

              {isRootAdmin && (
                <Link
                  href={localePath(locale, "/admin")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-canvas hover:border-accent px-5 py-2.5 text-xs font-semibold text-ink transition active:scale-95"
                >
                  <Shield className="h-4 w-4 text-accent" />
                  Bảng Quản Trị Hệ Thống (Root Admin)
                </Link>
              )}

              <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                <span className="text-xs text-muted">Muốn chuyển tài khoản khác?</span>
                <SignOutButton locale={locale} />
              </div>
            </div>
          </div>
        ) : (
          /* Normal Login / Register form */
          <LoginForm locale={locale} />
        )}

        <div className="text-center mt-6">
          <Link
            href={localePath(locale)}
            className="inline-flex items-center gap-1.5 text-xs text-subtle transition hover:text-accent font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {common("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
