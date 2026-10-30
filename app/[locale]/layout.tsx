import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, htmlLang, locales, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata, JsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "vi") as Locale;
  const t = getT(l, "home");
  const meta = buildMetadata({
    locale: l,
    title: `${t("heroTitle")} ${t("heroHighlight")}`,
    description: t("heroDesc"),
  });
  return {
    ...meta,
    title: {
      default: "Mythos Running — Chạy có cơ sở",
      template: "%s · Mythos Running",
    },
    applicationName: "Mythos Running",
    authors: [{ name: "Mythos Running" }],
    creator: "Mythos Running",
    keywords: [
      "chạy bộ",
      "running",
      "Huế",
      "pace calculator",
      "giáo án chạy bộ",
      "running tools",
      "Mythos Running",
    ],
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/brand/mark.svg" }],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FC" },
    { media: "(prefers-color-scheme: dark)", color: "#080D16" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getT(locale, "common");

  return (
    <html lang={htmlLang[locale]} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider locale={locale}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
            >
              {t("skipToContent")}
            </a>
            <div className="flex min-h-screen flex-col">
              <SiteHeader locale={locale} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter locale={locale} />
            </div>
          </I18nProvider>
        </ThemeProvider>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema(locale)} />
      </body>
    </html>
  );
}
