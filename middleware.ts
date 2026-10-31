import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/settings";
import { updateSession } from "@/lib/supabase/middleware";
import { articles } from "@/data/articles";
import { events } from "@/data/events";
import { routes } from "@/data/routes";
import { gearReviews } from "@/data/gear";
import { labProjects } from "@/data/labs";
import { tools } from "@/lib/tools/catalog";

const SKIP_PREFIXES = ["/_next", "/api", "/auth", "/fonts", "/brand", "/images"];

const slugs = {
  academy: new Set(articles.map((article) => article.slug)),
  events: new Set(events.map((event) => event.slug)),
  routes: new Set(routes.map((route) => route.slug)),
  gear: new Set(gearReviews.map((review) => review.slug)),
  labs: new Set(labProjects.map((project) => project.slug)),
  tools: new Set(tools.map((tool) => tool.slug)),
};

const categories = new Set(["beginner", "training", "physiology", "nutrition", "recovery", "gear", "racing"]);

function isMissingContent(segments: string[]) {
  if (segments.length < 3) return false;
  const section = segments[1];
  const slug = segments[2];

  if (section === "academy") {
    if (slug === "category") {
      if (segments.length === 3) return false;
      return segments.length > 4 || !categories.has(segments[3]);
    }
    if (segments.length > 3) return true;
    return !slugs.academy.has(slug);
  }

  if (section in slugs) {
    if (segments.length > 3) return true;
    return !slugs[section as keyof typeof slugs].has(slug);
  }

  return false;
}

function detectLocale(request: NextRequest) {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const lang of preferred) {
    if (lang.startsWith("zh")) return "zh-CN";
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("en")) return "en";
    if (lang.startsWith("vi")) return "vi";
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    /\.(ico|svg|png|jpg|jpeg|webp|gif|woff2?|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && isLocale(maybeLocale)) {
    if (isMissingContent(segments)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${maybeLocale}/not-found-page`;
      return NextResponse.rewrite(url, { status: 404 });
    }
    return updateSession(request);
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
