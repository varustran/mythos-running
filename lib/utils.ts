import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n/settings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  const map: Record<Locale, string> = {
    vi: "vi-VN",
    en: "en-GB",
    "zh-CN": "zh-CN",
    ja: "ja-JP",
    fr: "fr-FR",
    de: "de-DE",
  };
  return new Intl.DateTimeFormat(map[locale] || "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value: number, locale: Locale, digits = 0) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(secondsPerKm: number, unit: "km" | "mi" = "km") {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return "—";
  const perUnit = unit === "mi" ? secondsPerKm * 1.609344 : secondsPerKm;
  return `${formatDuration(perUnit)}/${unit}`;
}

export function parseTimeToSeconds(hours: string | number, minutes: string | number, seconds: string | number) {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  const s = Number(seconds) || 0;
  return h * 3600 + m * 60 + s;
}

export function readingTime(markdown: string, locale: Locale) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const wpm = locale === "ja" || (locale as string) === "zh" || (locale as string) === "zh-CN" ? 380 : 210;
  return Math.max(1, Math.round(words / wpm));
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
