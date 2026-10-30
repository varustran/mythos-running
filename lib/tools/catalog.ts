import type { ToolMeta } from "@/data/types";

export const tools: ToolMeta[] = [
  { slug: "pace-calculator", category: "pace", icon: "Timer", note: "formula", formula: "pace = time / distance" },
  { slug: "race-time-predictor", category: "race", icon: "TrendingUp", note: "estimate", formula: "T2 = T1 × (D2 / D1)^1.06" },
  { slug: "split-calculator", category: "race", icon: "Rows3", note: "formula", formula: "split = target time / number of segments" },
  { slug: "distance-converter", category: "distance", icon: "Ruler", note: "formula", formula: "1 mi = 1.609344 km" },
  { slug: "speed-converter", category: "pace", icon: "Gauge", note: "formula", formula: "speed = distance / time" },
  { slug: "heart-rate-zones", category: "heart", icon: "HeartPulse", note: "medical", formula: "HRmax ≈ 208 − 0.7 × age" },
  { slug: "cadence-calculator", category: "body", icon: "Footprints", note: "formula", formula: "cadence = steps / minutes" },
  { slug: "training-pace", category: "training", icon: "Activity", note: "estimate", formula: "training pace = 5K pace × factor" },
  { slug: "weekly-mileage", category: "training", icon: "CalendarRange", note: "formula", formula: "next week = current week × 1.10" },
  { slug: "race-countdown", category: "race", icon: "CalendarClock", note: "formula", formula: "remaining = race date − today" },
  { slug: "elevation-calculator", category: "distance", icon: "Mountain", note: "estimate", formula: "100 m climb ≈ 1 km flat" },
  { slug: "calorie-estimator", category: "body", icon: "Flame", note: "estimate", formula: "kcal ≈ MET × 3.5 × kg / 200 × minutes" },
  { slug: "training-plan", category: "training", icon: "ClipboardList", note: "estimate", formula: "progressive volume + 2-week taper" },
  { slug: "marathon-time", category: "race", icon: "Trophy", note: "estimate", formula: "Tmarathon = Thalf × (42.195 / 21.0975)^1.06" },
  { slug: "age-grading", category: "race", icon: "Medal", note: "estimate", formula: "age-graded = actual × age factor" },
];

export const toolCategories = ["pace", "distance", "heart", "training", "race", "body"] as const;

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string) {
  return tools.filter((tool) => tool.category === category);
}
