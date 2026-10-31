"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id?: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  role: "admin" | "editor" | "user";
  verified?: boolean;
}

export type AuthStatus = "initializing" | "guest" | "authenticated";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  status: AuthStatus;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  status: "initializing",
  isAdmin: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("initializing");

  const supabase = useMemo(() => createClient(), []);

  const fetchProfileForUser = useCallback(
    async (authUser: User) => {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, user_id, username, full_name, avatar_url, cover_url, bio, role, verified")
          .or(`id.eq.${authUser.id},user_id.eq.${authUser.id}`)
          .maybeSingle();

        if (data && !error) {
          const prof: UserProfile = {
            id: data.id,
            user_id: data.user_id,
            username: data.username || authUser.email?.split("@")[0] || "user",
            full_name: data.full_name || authUser.user_metadata?.full_name || "Thành viên Myso",
            avatar_url: data.avatar_url || authUser.user_metadata?.avatar_url || null,
            cover_url: data.cover_url || null,
            bio: data.bio || null,
            role: (data.role as UserProfile["role"]) || (authUser.email === "chuitv1907@gmail.com" ? "admin" : "user"),
            verified: data.verified || authUser.email === "chuitv1907@gmail.com",
          };
          setProfile(prof);
          return prof;
        }

        // Fallback profile if row doesn't exist yet
        const fallbackProf: UserProfile = {
          id: authUser.id,
          user_id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
          full_name: authUser.user_metadata?.full_name || "Thành viên Myso",
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: authUser.email === "chuitv1907@gmail.com" ? "admin" : "user",
          verified: authUser.email === "chuitv1907@gmail.com",
        };
        setProfile(fallbackProf);
        return fallbackProf;
      } catch (err) {
        console.error("Profile fetch error:", err);
        return null;
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfileForUser(user);
    }
  }, [user, fetchProfileForUser]);

  useEffect(() => {
    if (!supabase) {
      setStatus("guest");
      return;
    }

    // Initial check
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfileForUser(currentUser).then(() => {
          setStatus("authenticated");
        });
      } else {
        setUser(null);
        setProfile(null);
        setStatus("guest");
      }
    });

    // Reactive subscription to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfileForUser(session.user);
        setStatus("authenticated");
      } else {
        setUser(null);
        setProfile(null);
        setStatus("guest");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileForUser]);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setStatus("guest");
    }
  }, [supabase]);

  const isAdmin = user?.email === "chuitv1907@gmail.com" || profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        status,
        isAdmin,
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
