"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AccountSessionData, UserRole } from "@/lib/supabase/server";
import {
  saveEncryptedSession,
  getStoredSession,
  clearStoredSession,
} from "@/lib/auth/sessionCrypto";

export interface UserProfile {
  id: string;
  user_id?: string;
  email?: string | null;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  role: UserRole;
  verified?: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  interests?: string[];
  skills?: string[];
  topics?: string[];
  followers_count?: number;
  following_count?: number;
  points_balance?: number;
  gold_balance?: number;
  wallet_address?: string | null;
}

export type AccountStatus =
  | "initializing"
  | "guest"
  | "authenticated_no_profile"
  | "profile_incomplete"
  | "profile_complete"
  | "suspended";

interface AuthContextType {
  user: User | { id: string; email?: string | null } | null;
  profile: UserProfile | null;
  status: AccountStatus;
  isAdmin: boolean;
  isProfileComplete: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  status: "initializing",
  isAdmin: false,
  isProfileComplete: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: AccountSessionData;
}) {
  const [user, setUser] = useState<User | { id: string; email?: string | null } | null>(() => {
    if (initialSession?.user) return initialSession.user;
    if (typeof window !== "undefined") {
      const stored = getStoredSession();
      if (stored?.user) return stored.user;
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (initialSession?.profile) {
      const p = initialSession.profile;
      return {
        id: p.id,
        user_id: p.userId,
        email: p.email,
        username: p.username || "user",
        full_name: p.fullName || "Thành viên Myso",
        avatar_url: p.avatarUrl,
        role: p.role,
        onboarding_completed: p.onboardingCompleted,
        onboarding_step: p.onboardingStep,
        points_balance: p.pointsBalance ?? 0,
        gold_balance: p.goldBalance ?? 0,
        wallet_address: p.walletAddress ?? null,
      };
    }
    if (typeof window !== "undefined") {
      const stored = getStoredSession();
      if (stored?.profile) return stored.profile;
    }
    return null;
  });

  const [status, setStatus] = useState<AccountStatus>(() => {
    if (initialSession) {
      return initialSession.status;
    }
    if (typeof window !== "undefined") {
      const stored = getStoredSession();
      if (stored?.status) return stored.status;
    }
    return "initializing";
  });

  const supabase = useMemo(() => createClient(), []);

  // Fetch or safely initialize profile for an authenticated user
  const syncAccountProfile = useCallback(
    async (authUser: User | { id: string; email?: string | null }) => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const sessionData: AccountSessionData = await res.json();
          if (sessionData.profile) {
            const p = sessionData.profile;
            const newProf: UserProfile = {
              id: p.id,
              user_id: p.userId,
              email: p.email,
              username: p.username || "user",
              full_name: p.fullName || "Thành viên Myso",
              avatar_url: p.avatarUrl,
              role: p.role,
              onboarding_completed: p.onboardingCompleted,
              onboarding_step: p.onboardingStep,
              points_balance: p.pointsBalance ?? 0,
              gold_balance: p.goldBalance ?? 0,
              wallet_address: p.walletAddress ?? null,
            };
            setProfile(newProf);
            setStatus(sessionData.status);
            saveEncryptedSession(authUser, newProf);
            return;
          }

          // If authenticated but no profile, automatically initialize profile row
          if (sessionData.status === "authenticated_no_profile") {
            const initRes = await fetch("/api/auth/init-profile", { method: "POST" });
            if (initRes.ok) {
              const initData = await initRes.json();
              if (initData.profile) {
                const ip = initData.profile;
                const newProf: UserProfile = {
                  id: ip.id,
                  user_id: ip.user_id,
                  email: ip.email,
                  username: ip.username,
                  full_name: ip.full_name,
                  avatar_url: ip.avatar_url,
                  role: ip.role,
                  onboarding_completed: true,
                  onboarding_step: 3,
                  points_balance: Number(ip.points_balance || 0),
                  gold_balance: Number(ip.gold_balance || 0),
                  wallet_address: ip.wallet_address || null,
                };
                setProfile(newProf);
                setStatus("profile_complete");
                saveEncryptedSession(authUser, newProf);
                return;
              }
            }
          }
        }

        // Direct fallback check if /api/auth/me fails
        if (supabase) {
          const { data: dbProf } = await supabase
            .from("profiles")
            .select("id, user_id, email, username, full_name, avatar_url, role, points_balance, gold_balance, wallet_address")
            .or(`user_id.eq.${authUser.id},id.eq.${authUser.id},email.eq.${authUser.email}`)
            .maybeSingle();

          if (dbProf) {
            const isCompleted = Boolean(dbProf.username && dbProf.full_name);
            const newProf: UserProfile = {
              id: dbProf.id,
              user_id: dbProf.user_id,
              email: dbProf.email,
              username: dbProf.username || "user",
              full_name: dbProf.full_name || "Thành viên Myso",
              avatar_url: dbProf.avatar_url,
              role: (dbProf.role as UserRole) || "user",
              onboarding_completed: isCompleted,
              onboarding_step: isCompleted ? 3 : 1,
              points_balance: Number(dbProf.points_balance || 0),
              gold_balance: Number(dbProf.gold_balance || 0),
              wallet_address: dbProf.wallet_address || null,
            };
            setProfile(newProf);
            setStatus(isCompleted ? "profile_complete" : "profile_incomplete");
            saveEncryptedSession(authUser, newProf);
            return;
          }
        }

        setStatus("authenticated_no_profile");
      } catch (err) {
        console.error("syncAccountProfile error:", err);
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncAccountProfile(user);
    }
  }, [user, syncAccountProfile]);

  useEffect(() => {
    // 1. Immediately hydrate from stored encrypted session if present
    const stored = getStoredSession();
    if (stored) {
      setUser(stored.user);
      setProfile(stored.profile);
      setStatus(stored.status);
    }

    if (!supabase) {
      if (!stored) setStatus("guest");
      return;
    }

    // 2. Background verify with Supabase Auth
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        syncAccountProfile(currentUser);
      } else {
        // Only set guest if there was no active stored session
        const currentStored = getStoredSession();
        if (!currentStored) {
          setUser(null);
          setProfile(null);
          setStatus("guest");
        }
      }
    });

    // 3. Reactive subscription to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await syncAccountProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        clearStoredSession();
        setUser(null);
        setProfile(null);
        setStatus("guest");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncAccountProfile]);

  const logout = useCallback(async () => {
    clearStoredSession();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setStatus("guest");
    window.location.href = "/";
  }, [supabase]);

  const isAdmin = user?.email === "chuitv1907@gmail.com" || profile?.role === "admin";
  const isProfileComplete = status === "profile_complete";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        status,
        isAdmin,
        isProfileComplete,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
