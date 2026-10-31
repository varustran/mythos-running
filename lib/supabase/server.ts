import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; middleware refreshes the session.
          }
        },
      },
    },
  );
}

export type UserRole = "admin" | "moderator" | "editor" | "contributor" | "user";

export type SessionProfile = {
  id: string;
  userId: string;
  email: string | null;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  onboardingCompleted: boolean;
  onboardingStep: number;
};

export type AccountStatus =
  | "guest"
  | "authenticated_no_profile"
  | "profile_incomplete"
  | "profile_complete";

export interface AccountSessionData {
  user: {
    id: string;
    email?: string | null;
  } | null;
  profile: SessionProfile | null;
  status: AccountStatus;
}

export const getAccountSession = cache(async (): Promise<AccountSessionData> => {
  const supabase = await createClient();
  if (!supabase) {
    return { user: null, profile: null, status: "guest" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, status: "guest" };
  }

  // Query database profiles table by user_id, id, or email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, email, username, full_name, avatar_url, role, onboarding_completed, onboarding_step")
    .or(`user_id.eq.${user.id},id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (!profile) {
    return {
      user: { id: user.id, email: user.email },
      profile: null,
      status: "authenticated_no_profile",
    };
  }

  const isRootAdmin = user.email === "chuitv1907@gmail.com";
  const userRole: UserRole = isRootAdmin
    ? "admin"
    : (profile.role as UserRole) || "user";

  const sessionProf: SessionProfile = {
    id: profile.id,
    userId: profile.user_id || user.id,
    email: profile.email || user.email || null,
    username: profile.username || null,
    fullName: profile.full_name || user.user_metadata?.full_name || "Thành viên Myso",
    avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url || null,
    role: userRole,
    onboardingCompleted: Boolean(profile.onboarding_completed || isRootAdmin),
    onboardingStep: profile.onboarding_step || 1,
  };

  const status: AccountStatus = sessionProf.onboardingCompleted
    ? "profile_complete"
    : "profile_incomplete";

  return {
    user: { id: user.id, email: user.email },
    profile: sessionProf,
    status,
  };
});

export const getCurrentProfile = cache(async (): Promise<SessionProfile | null> => {
  const session = await getAccountSession();
  return session.profile;
});

export async function isAdmin() {
  const session = await getAccountSession();
  return session.profile?.role === "admin";
}
