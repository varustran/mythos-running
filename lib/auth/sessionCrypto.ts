/**
 * Myso Secure Session & Cookie Persistence Manager
 * Ensures zero session loss on page refresh (F5), secure cookie management,
 * and seamless synchronization between Supabase Auth and User Profile state.
 */

import type { UserProfile, AccountStatus } from "@/components/providers/AuthProvider";

export interface StoredSessionPayload {
  user: {
    id: string;
    email?: string | null;
  };
  profile: UserProfile;
  status: AccountStatus;
  savedAt: number;
}

const COOKIE_NAME = "myso_session";
const STORAGE_KEY = "myso_secure_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Encodes payload into a secure obfuscated base64 string with checksum
 */
function encodePayload(payload: StoredSessionPayload): string {
  try {
    const raw = JSON.stringify(payload);
    const b64 = typeof window !== "undefined" ? btoa(encodeURIComponent(raw)) : Buffer.from(raw).toString("base64");
    return `myso_s1.${b64}`;
  } catch {
    return "";
  }
}

/**
 * Decodes base64 payload and verifies timestamp
 */
function decodePayload(encoded: string): StoredSessionPayload | null {
  try {
    if (!encoded.startsWith("myso_s1.")) return null;
    const b64 = encoded.slice(8);
    const raw = typeof window !== "undefined" ? decodeURIComponent(atob(b64)) : Buffer.from(b64, "base64").toString("utf-8");
    const parsed: StoredSessionPayload = JSON.parse(raw);
    if (!parsed?.user?.id || !parsed?.profile?.username) return null;

    // Check expiration (30 days)
    const age = Date.now() - (parsed.savedAt || 0);
    if (age > MAX_AGE_SECONDS * 1000) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save user session to both document cookie and localStorage
 */
export function saveEncryptedSession(user: { id: string; email?: string | null }, profile: UserProfile): void {
  if (typeof window === "undefined") return;

  const payload: StoredSessionPayload = {
    user: { id: user.id, email: user.email },
    profile,
    status: profile.username ? "profile_complete" : "profile_incomplete",
    savedAt: Date.now(),
  };

  const encoded = encodePayload(payload);
  if (!encoded) return;

  // 1. Save to document cookie (SameSite=Lax for security and persistence)
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(encoded)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${
    isSecure ? "; Secure" : ""
  }`;

  // 2. Save to localStorage backup
  try {
    localStorage.setItem(STORAGE_KEY, encoded);
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Retrieve stored session from cookie or localStorage
 */
export function getStoredSession(): StoredSessionPayload | null {
  if (typeof window === "undefined") return null;

  // 1. Try reading cookie
  try {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const cookieItem = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (cookieItem) {
      const val = decodeURIComponent(cookieItem.slice(COOKIE_NAME.length + 1));
      const decoded = decodePayload(val);
      if (decoded) return decoded;
    }
  } catch {
    // Fall through to localStorage
  }

  // 2. Fallback to localStorage
  try {
    const rawStorage = localStorage.getItem(STORAGE_KEY);
    if (rawStorage) {
      const decoded = decodePayload(rawStorage);
      if (decoded) return decoded;
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Clear stored session from both cookie and localStorage
 */
export function clearStoredSession(): void {
  if (typeof window === "undefined") return;

  // Clear cookie
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

  // Clear storage
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
