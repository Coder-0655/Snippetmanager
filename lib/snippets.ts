"use client";

import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { localStorageService, type LocalSnippet } from "./local-storage";
import { getCurrentUserId } from "./clerk-auth";
import type { Snippet } from "./supabase";

// Type that works for both Supabase and local snippets
export type UnifiedSnippet = Snippet | LocalSnippet;

class SnippetsService {
  private isLocalModeActive = !isSupabaseConfigured();

  async getSnippets(): Promise<UnifiedSnippet[]> {
    if (this.isLocalModeActive) {
      return localStorageService.getSnippets();
    } else {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("snippets")
        .select("*")
        .order("created_at", { ascending: false });

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("snippets")
        .insert([
          {
            ...snippet,
            user_id: user.id,
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
export const getSnippets = () => snippetsService.getSnippets();
export const createSnippet = (snippet: Parameters<typeof snippetsService.createSnippet>[0], userId?: string) => 
  snippetsService.createSnippet(snippet, userId);
export const updateSnippet = (id: string, updates: Parameters<typeof snippetsService.updateSnippet>[1]) => 
  snippetsService.updateSnippet(id, updates);
export const deleteSnippet = (id: string) => snippetsService.deleteSnippet(id);
export const searchSnippets = (query: string) => snippetsService.searchSnippets(query);
export const getAllTags = () => snippetsService.getAllTags();
export const getAllTagsFromSnippets = () => snippetsService.getAllTagsFromSnippets();
export const getSnippetsByTag = (tag: string) => snippetsService.getSnippetsByTag(tag);

// Export the service instance for advanced usage
export default snippetsService;