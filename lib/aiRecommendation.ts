/**
 * AI-powered User Behavior & Recommendation Engine for Myso
 * Analyzes topic affinities, reading patterns, and interaction history
 * to personalize the "Dành cho bạn / For You" feed.
 */

export interface UserInterestProfile {
  categories: Record<string, number>; // category -> score
  tags: Record<string, number>; // tag -> score
  totalInteractions: number;
  lastActive: string;
}

const STORAGE_KEY = "myso_ai_user_interest_profile";

export function getUserInterestProfile(): UserInterestProfile {
  if (typeof window === "undefined") {
    return { categories: {}, tags: {}, totalInteractions: 0, lastActive: new Date().toISOString() };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const initial: UserInterestProfile = {
    categories: {
      ai: 5,
      technology: 4,
      science: 3,
      startup: 2,
    },
    tags: {
      "#Myso": 5,
      "#AI": 4,
      "#CongNghe2026": 3,
    },
    totalInteractions: 5,
    lastActive: new Date().toISOString(),
  };
  return initial;
}

export function trackUserInteraction(
  category?: string,
  tags: string[] = [],
  action: "view" | "like" | "comment" | "search" | "bookmark" | "repost" = "view"
) {
  if (typeof window === "undefined") return;

  const weights: Record<string, number> = {
    view: 1,
    search: 2,
    like: 3,
    bookmark: 4,
    repost: 4,
    comment: 5,
  };

  const weight = weights[action] || 1;
  const profile = getUserInterestProfile();

  if (category) {
    profile.categories[category] = (profile.categories[category] || 0) + weight;
  }

  tags.forEach((t) => {
    const clean = t.startsWith("#") ? t : `#${t}`;
    profile.tags[clean] = (profile.tags[clean] || 0) + weight;
  });

  profile.totalInteractions += 1;
  profile.lastActive = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}

  // Async log to backend for global recommendation improvements
  fetch("/api/social/behavior", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, tags, action }),
  }).catch(() => {});
}

/**
 * Score a post based on AI interest affinity
 */
export function calculatePostAffinity(
  post: { category?: string; content?: string },
  profile: UserInterestProfile
): number {
  let score = 0;

  // Category match
  if (post.category && profile.categories[post.category]) {
    score += profile.categories[post.category] * 2;
  }

  // Tag match in content
  if (post.content) {
    Object.entries(profile.tags).forEach(([tag, weight]) => {
      if (post.content?.toLowerCase().includes(tag.toLowerCase())) {
        score += weight * 1.5;
      }
    });
  }

  return score;
}
