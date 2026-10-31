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
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = (isLocale(locale) ? locale : "vi") as Locale;
  const t = getT(l, "home");
  const meta = buildMetadata({
    locale: l,
    title: "Myso — Không Gian Cho Mọi Ý Tưởng",
    description: "Mạng xã hội mở, bách khoa tri thức số, phòng chat mã hóa và nền tảng sáng tạo nội dung đa lĩnh vực.",
  });
  return {
    ...meta,
    title: {
      default: "Myso — Không Gian Cho Mọi Ý Tưởng",
      template: "%s · Myso",
    },
    applicationName: "Myso",
    authors: [{ name: "Myso Network" }],
    creator: "Myso",
    keywords: [
      "mạng xã hội",
      "myso",
      "ý tưởng",
      "bách khoa số",
      "wiki",
      "công nghệ",
      "AI",
      "chat mã hóa",
      "thảo luận",
      "kiếm tiền sáng tạo",
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
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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
      <body className="pb-16 lg:pb-0">
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
            <MobileBottomBar locale={locale} />
          </I18nProvider>
        </ThemeProvider>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema(locale)} />
      </body>
    </html>
  );
}
