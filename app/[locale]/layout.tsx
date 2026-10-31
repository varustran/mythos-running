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
    title: "Mythos Running — Nền Tảng Xuất Bản & Kết Nối Cộng Đồng Chạy Bộ Toàn Cầu",
    description: "Không gian xuất bản bài viết chuyên nghiệp, khoa học chạy bộ, công cụ tính toán và kết nối cộng đồng runners quốc tế.",
  });
  return {
    ...meta,
    title: {
      default: "Mythos Running — Nền Tảng Chạy Bộ & Xuất Bản Tri Thức Thể Thao",
      template: "%s · Mythos Running",
    },
    applicationName: "Mythos Running",
    authors: [{ name: "Mythos Running Collective" }],
    creator: "Mythos Running",
    keywords: [
      "mythos running",
      "chạy bộ",
      "marathon",
      "running science",
      "cộng đồng chạy bộ",
      "rich text editor",
      "pace calculator",
      "strava",
      "thể thao",
    ],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/apple-touch-icon.png",
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
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
