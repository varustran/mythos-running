import type { Locale } from "@/lib/i18n/settings";

export type Localized = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type ArticleCategory =
  | "beginner"
  | "training"
  | "physiology"
  | "nutrition"
  | "recovery"
  | "gear"
  | "racing";

export type Article = {
  slug: string;
  category: ArticleCategory;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean;
  readingMinutes: number;
  author: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  sources?: string[];
};

export type RunningEvent = {
  slug: string;
  title: Localized;
  description: Localized;
  date: string;
  endDate?: string;
  location: Localized;
  city: string;
  distances: number[];
  organizer: string;
  officialUrl: string | null;
  featured?: boolean;
  sample: boolean;
};

export type RouteSurface = "road" | "trail" | "track" | "mixed";
export type RouteDifficulty = "easy" | "moderate" | "hard";

export type RunningRoute = {
  slug: string;
  name: Localized;
  description: Localized;
  distanceKm: number;
  elevationM: number;
  surface: RouteSurface;
  difficulty: RouteDifficulty;
  lighting: Localized;
  safety: Localized;
  startPoint: Localized;
  bestTime: Localized;
  rating: number;
  reviews: number;
  featured?: boolean;
};

export type GearCategory = "shoes" | "watches" | "apparel" | "hydration" | "recovery" | "accessories";

export type GearReview = {
  slug: string;
  category: GearCategory;
  title: Localized;
  excerpt: Localized;
  verdict: Localized;
  pros: LocalizedList;
  cons: LocalizedList;
  specs: { label: string; value: string }[];
  body: Localized;
  publishedAt: string;
  readingMinutes: number;
};

export type LabStatus = "active" | "published" | "planned";

export type LabProject = {
  slug: string;
  title: Localized;
  summary: Localized;
  description: Localized;
  methodology: Localized;
  status: LabStatus;
  updatedAt: string;
};

export type ToolCategory = "pace" | "distance" | "heart" | "training" | "race" | "body";

export type ToolMeta = {
  slug: string;
  category: ToolCategory;
  formula: string;
  note: "formula" | "estimate" | "medical";
  icon: string;
};
