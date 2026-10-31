import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, htmlLang, locales, type Locale } from "@/lib/i18n/settings";
import { getT } from "@/lib/i18n/server";
import { buildMetadata, JsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getAccountSession } from "@/lib/supabase/server";
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
    title: "Myso — Nền Tảng Cộng Đồng & Xuất Bản Tri Thức Hiện Đại",
    description: "Không gian kết nối cộng đồng, viết bài chuẩn WYSIWYG, thảo luận đa chiều và bách khoa mở.",
  });
  return {
    ...meta,
    title: {
      default: "Myso — Nền Tảng Cộng Đồng & Xuất Bản Tri Thức Hiện Đại",
      template: "%s · Myso",
    },
    applicationName: "Myso",
    authors: [{ name: "Myso Community" }],
    creator: "Myso",
    keywords: [
      "myso",
      "mạng xã hội",
      "cộng đồng",
      "diễn đàn",
      "wiki",
      "wysiwyg editor",
      "threads",
      "reddit",
      "xuất bản bài viết",
      "trò chuyện mã hóa",
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
  const sessionData = await getAccountSession();

  return (
    <html lang={htmlLang[locale]} suppressHydrationWarning>
      <body className="pb-16 lg:pb-0">
        <ThemeProvider>
          <I18nProvider locale={locale}>
            <AuthProvider initialSession={sessionData}>
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
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema(locale)} />
      </body>
    </html>
  );
}
