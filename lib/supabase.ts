import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Check if Supabase environment variables are available
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables not configured");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Legacy function for compatibility
export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables not configured");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      snippets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          code: string;
          language: string;
          tags: string[];
          project_id: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          code: string;
          language: string;
          tags?: string[];
          project_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          code?: string;
          language?: string;
          tags?: string[];
          project_id?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      community: {
        Row: {
          id: string;
          snippet_id: string;
          user_id: string;
          title: string;
          code: string;
          language: string;
          tags: string[];
          description: string | null;
          project_id: string | null;
          likes_count: number;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          snippet_id: string;
          user_id: string;
          title: string;
          code: string;
          language: string;
          tags?: string[];
          description?: string | null;
          project_id?: string | null;
          likes_count?: number;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          snippet_id?: string;
          user_id?: string;
          title?: string;
          code?: string;
          language?: string;
          tags?: string[];
          description?: string | null;
          project_id?: string | null;
          likes_count?: number;
          views_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_likes: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type Snippet = Database["public"]["Tables"]["snippets"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CommunitySnippet = Database["public"]["Tables"]["community"]["Row"];
export type CommunityLike = Database["public"]["Tables"]["community_likes"]["Row"];

export type CommunitySnippetWithProfile = CommunitySnippet & {
  author_name?: string;
  author_avatar?: string;
  user_liked?: boolean;
};
