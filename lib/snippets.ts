"use client";

import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { localStorageService, type LocalSnippet } from "./local-storage";
import { getCurrentUserId } from "./clerk-auth";
import type { Snippet } from "./supabase";

// Default tags that are created for every new user
export const DEFAULT_TAGS = [
  { name: "JavaScript", color: "bg-yellow-500" },
  { name: "React", color: "bg-blue-500" },
  { name: "TypeScript", color: "bg-blue-600" },
  { name: "CSS", color: "bg-purple-500" },
  { name: "HTML", color: "bg-orange-500" },
  { name: "Node.js", color: "bg-green-500" },
  { name: "Python", color: "bg-green-600" },
  { name: "API", color: "bg-indigo-500" },
  { name: "Utility", color: "bg-gray-500" },
  { name: "Component", color: "bg-pink-500" },
];

// Type that works for both Supabase and local snippets
export type UnifiedSnippet = Snippet | LocalSnippet;

class SnippetsService {
  private isLocalModeActive = !isSupabaseConfigured();

  async getSnippets(userId?: string): Promise<UnifiedSnippet[]> {
    if (this.isLocalModeActive) {
      return localStorageService.getSnippets();
    } else {
      const supabase = createSupabaseClient();
      let query = supabase
        .from("snippets")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by user if userId is provided
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching snippets:", error);
        throw error;
      }

      return data || [];
    }
  }

  async createSnippet(snippet: {
    title: string;
    code: string;
    language: string;
    tags: string[];
    description?: string;
    project_id?: string | null;
  }, userId?: string): Promise<UnifiedSnippet> {
    if (this.isLocalModeActive) {
      const currentUserId = userId || getCurrentUserId();
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      return localStorageService.addSnippet({
        ...snippet,
        user_id: currentUserId,
      });
    } else {
      const supabase = createSupabaseClient();
      
      // Use provided userId or fallback to auth check
      let userIdToUse = userId;
      if (!userIdToUse) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from("snippets")
        .insert([
          {
            ...snippet,
            user_id: userIdToUse,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating snippet:", error);
        throw error;
      }

      return data;
    }
  }

  async updateSnippet(
    id: string,
    updates: {
      title?: string;
      code?: string;
      language?: string;
      tags?: string[];
      description?: string;
      project_id?: string | null;
    },
  ): Promise<UnifiedSnippet> {
    if (this.isLocalModeActive) {
      const updatedSnippet = localStorageService.updateSnippet(id, updates);
      if (!updatedSnippet) {
        throw new Error("Snippet not found");
      }
      return updatedSnippet;
    } else {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("snippets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating snippet:", error);
        throw error;
      }

      return data;
    }
  }

  async deleteSnippet(id: string): Promise<void> {
    if (this.isLocalModeActive) {
      const deleted = localStorageService.deleteSnippet(id);
      if (!deleted) {
        throw new Error("Snippet not found");
      }
    } else {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("snippets").delete().eq("id", id);

      if (error) {
        console.error("Error deleting snippet:", error);
        throw error;
      }
    }
  }

  async searchSnippets(query: string): Promise<UnifiedSnippet[]> {
    if (this.isLocalModeActive) {
      return localStorageService.searchSnippets(query);
    } else {
      if (!query.trim()) {
        return this.getSnippets();
      }

      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .or(
          `title.ilike.%${query}%,code.ilike.%${query}%,tags.cs.{${query}}`,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching snippets:", error);
        throw error;
      }

      return data || [];
    }
  }

  async getAllTags(): Promise<string[]> {
    if (this.isLocalModeActive) {
      return localStorageService.getAllTags();
    } else {
      const snippets = await this.getSnippets();
      const allTags = snippets.flatMap((snippet) => snippet.tags || []);
      return [...new Set(allTags)].sort();
    }
  }

  async getAllTagsFromSnippets(): Promise<Array<{ tag: string; count: number }>> {
    if (this.isLocalModeActive) {
      const snippets = localStorageService.getSnippets();
      const tagCounts = new Map<string, number>();
      
      snippets.forEach(snippet => {
        snippet.tags?.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    } else {
      const snippets = await this.getSnippets();
      const tagCounts = new Map<string, number>();
      
      snippets.forEach(snippet => {
        snippet.tags?.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    }
  }

  async getSnippetsByTag(tag: string): Promise<UnifiedSnippet[]> {
    if (this.isLocalModeActive) {
      return localStorageService.getSnippetsByTag(tag);
    } else {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .contains("tags", [tag])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets by tag:", error);
        throw error;
      }

      return data || [];
    }
  }

  // Utility methods
  isLocalMode(): boolean {
    return this.isLocalModeActive;
  }

  // For local mode, export/import functionality
  async initializeDefaultTags(userId: string): Promise<void> {
    if (this.isLocalModeActive) {
      // For local mode, store default tags in localStorage
      const existingTags = localStorageService.getAllTags();
      if (existingTags.length === 0) {
        // Store default tags in localStorage
        const defaultTagData = DEFAULT_TAGS.map(tag => ({
          name: tag.name,
          color: tag.color,
          count: 0
        }));
        localStorage.setItem('user-default-tags', JSON.stringify(defaultTagData));
      }
    } else {
      const supabase = createSupabaseClient();
      
      // Check if user already has tags
      const { data: existingTags } = await supabase
        .from("snippets")
        .select("tags")
        .eq("user_id", userId)
        .limit(1);

      // If user has no snippets yet, we'll create default tags when they create their first snippet
      // For now, we'll store the default tags in a separate table or handle them client-side
    }
  }

  exportData() {
    if (this.isLocalModeActive) {
      return localStorageService.exportData();
    } else {
      throw new Error("Export is only available in local mode");
    }
  }

  importData(data: { snippets?: LocalSnippet[] }) {
    if (this.isLocalModeActive) {
      localStorageService.importData(data);
    } else {
      throw new Error("Import is only available in local mode");
    }
  }
}

// Create singleton instance
const snippetsService = new SnippetsService();

// Export functions for backward compatibility
export const getSnippets = (userId?: string) => snippetsService.getSnippets(userId);
export const createSnippet = (snippet: Parameters<typeof snippetsService.createSnippet>[0], userId?: string) => 
  snippetsService.createSnippet(snippet, userId);
export const updateSnippet = (id: string, updates: Parameters<typeof snippetsService.updateSnippet>[1]) => 
  snippetsService.updateSnippet(id, updates);
export const deleteSnippet = (id: string) => snippetsService.deleteSnippet(id);
export const searchSnippets = (query: string) => snippetsService.searchSnippets(query);
export const getAllTags = () => snippetsService.getAllTags();
export const getAllTagsFromSnippets = () => snippetsService.getAllTagsFromSnippets();
export const getSnippetsByTag = (tag: string) => snippetsService.getSnippetsByTag(tag);
export const initializeDefaultTags = (userId: string) => snippetsService.initializeDefaultTags(userId);

// Export the service instance for advanced usage
export default snippetsService;