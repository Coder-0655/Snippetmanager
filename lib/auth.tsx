"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { localAuthService } from "@/lib/local-auth";
import type { LocalUser } from "@/lib/local-storage";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | LocalUser | null;
  session: Session | null;
  loading: boolean;
  isLocalMode: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | LocalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (isLocalMode) {
      // Local mode initialization
      const localUser = localAuthService.getCurrentUser();
      setUser(localUser);
      setSession(null);
      setLoading(false);
    } else {
      // Supabase mode initialization
      const supabase = createSupabaseClient();
      
      if (!supabase) {
        // Fallback to local mode if Supabase fails
        const localUser = localAuthService.getCurrentUser();
        setUser(localUser);
        setSession(null);
        setLoading(false);
        return;
      }
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [isLocalMode]);

  const signUp = async (email: string, password: string, name?: string) => {
    if (isLocalMode) {
      const localUser = await localAuthService.signUp({ email, password, name });
      setUser(localUser);
    } else {
      const supabase = createSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase not configured");
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isLocalMode) {
      const localUser = await localAuthService.signIn({ email, password });
      setUser(localUser);
    } else {
      const supabase = createSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase not configured");
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    }
  };

  

  const signInDemo = async () => {
    if (isLocalMode) {
      const demoUser = await localAuthService.signInDemo();
      setUser(demoUser);
    } else {
      throw new Error("Demo login is only available in local mode");
    }
  };

  const signOut = async () => {
    if (isLocalMode) {
      await localAuthService.signOut();
      setUser(null);
    } else {
      const supabase = createSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase not configured");
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isLocalMode,
    signUp,
    signIn,
    signInDemo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
