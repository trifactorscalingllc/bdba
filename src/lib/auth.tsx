// ─── Auth context for PB Assistant dashboard ────────────────────────────────
// Wraps the app with a Supabase auth session listener. Exposes:
//   useAuth() → { user, profile, role, slug, isLoading, signIn, signOut }
//
// Profile (role + slug) is fetched from public.profiles on session change.
// The dashboard reads `role` to decide coach vs student view.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "coach" | "student";

export interface ProfileRow {
  user_id: string;
  role: Role;
  slug: string | null;
  display_name: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  role: Role | null;
  slug: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, role, slug, display_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] fetchProfile error:", error);
    return null;
  }
  return data as ProfileRow | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial session check.
    //
    // ⚠ Critical: `isLoading` is decoupled from `profile` loading. The state
    // tracks "do we know if you're signed in?" — NOT "do we have your
    // profile row yet?" Setting isLoading=false the moment getSession()
    // resolves means ProtectedRoute can route the user immediately, and
    // profile-dependent UI (Dashboard) gates on `profile` separately.
    //
    // Why: the earlier version awaited fetchProfile() inline inside this
    // .then() callback. When supabase-js fires the synchronous
    // onAuthStateChange event during/after getSession (with INITIAL_SESSION
    // or TOKEN_REFRESHED), the auth client may still be holding internal
    // locks. Awaiting another Supabase call from the listener context could
    // deadlock — symptom: "Loading…" screen forever after sign-in because
    // setIsLoading(false) on line `await fetchProfile() → setProfile() →
    // setIsLoading(false)` never reached.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
      if (data.session?.user) {
        const uid = data.session.user.id;
        // Defer profile fetch off the current tick (matches listener pattern).
        setTimeout(() => {
          fetchProfile(uid).then((p) => {
            if (mounted) setProfile(p);
          });
        }, 0);
      }
    });

    // Subscribe to auth state changes (login/logout/refresh).
    //
    // Same setTimeout(0) defer pattern as above — never call Supabase methods
    // synchronously inside this callback or supabase-js can deadlock.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        const uid = sess.user.id;
        setTimeout(() => {
          fetchProfile(uid).then((p) => {
            if (mounted) setProfile(p);
          });
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    user,
    session,
    profile,
    role: profile?.role ?? null,
    slug: profile?.slug ?? null,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
