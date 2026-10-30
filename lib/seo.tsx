import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { locales, type Locale } from "@/lib/i18n/settings";

type SeoInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean === "/" ? "" : clean}`;
}

export function buildMetadata({
  locale,
  path = "",
  title,
  description,
  image,
  type = "website",
  publishedTime,
  noIndex,
}: SeoInput): Metadata {
  const clean = path.replace(/^\/+/, "");
  const canonical = `${siteConfig.url}/${locale}${clean ? `/${clean}` : ""}`;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${siteConfig.url}/${l}${clean ? `/${clean}` : ""}`;
  }
  languages["x-default"] = `${siteConfig.url}/vi${clean ? `/${clean}` : ""}`;

  const ogImage = image || `${siteConfig.url}/brand/og-default.png`;

  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical, languages },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hue",
      addressCountry: "VN",
    },
    sameAs: siteConfig.social.map((s) => s.href),
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}`,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/${locale}/academy?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.image,
    inLanguage: input.locale,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author: { "@type": "Person", name: input.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
