import { createSupabaseClient } from './supabase';
import type { CommunitySnippet, CommunityLike, Snippet } from './supabase';

export interface CommunitySnippetWithProfile extends CommunitySnippet {
  author_name?: string;
  author_avatar?: string;
  user_likes?: boolean;
}

class CommunityService {
  private supabase = createSupabaseClient();

  // Toggle snippet public/private status
  async toggleSnippetPublic(snippetId: string, isPublic: boolean): Promise<boolean> {
    try {
      // Update the snippet's is_public status
      const { error: snippetError } = await this.supabase
        .from('snippets')
        .update({ 
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', snippetId);

      if (snippetError) {
        console.error('Error updating snippet public status:', snippetError);
        return false;
      }

      if (isPublic) {
        // Add to community table
        return await this.addToyCommunity(snippetId);
      } else {
        // Remove from community table
        return await this.removeFromCommunity(snippetId);
      }
    } catch (error) {
      console.error('Error toggling snippet public status:', error);
      return false;
    }
  }

  // Add snippet to community
  private async addToyCommunity(snippetId: string): Promise<boolean> {
    try {
      // Get the snippet data
      const { data: snippet, error: snippetError } = await this.supabase
        .from('snippets')
        .select('*')
        .eq('id', snippetId)
        .single();

      if (snippetError || !snippet) {
        console.error('Error fetching snippet for community:', snippetError);
        return false;
      }

      // Check if already exists in community
      const { data: existing } = await this.supabase
        .from('community')
        .select('id')
        .eq('snippet_id', snippetId)
        .single();

      if (existing) {
        // Already exists, just return true
        return true;
      }

      // Insert into community table
      const { error: communityError } = await this.supabase
        .from('community')
        .insert({
          snippet_id: snippet.id,
          user_id: snippet.user_id,
          title: snippet.title,
          code: snippet.code,
          language: snippet.language,
          tags: snippet.tags,
          project_id: snippet.project_id,
          likes_count: 0,
          views_count: 0,
          created_at: snippet.created_at,
          updated_at: new Date().toISOString()
        });

      if (communityError) {
        console.error('Error adding snippet to community:', communityError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding snippet to community:', error);
      return false;
    }
  }

  // Remove snippet from community
  private async removeFromCommunity(snippetId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('community')
        .delete()
        .eq('snippet_id', snippetId);

      if (error) {
        console.error('Error removing snippet from community:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing snippet from community:', error);
      return false;
    }
  }

    // Get all public snippets for community hub
  async getCommunitySnippets(
    limit: number = 20,
    offset: number = 0,
    searchQuery?: string,
    language?: string,
    tags?: string[],
    sortBy: 'created_at' | 'likes_count' | 'views_count' = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<CommunitySnippetWithProfile[]> {
    try {
      let query = this.supabase
        .from('community')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .range(offset, offset + limit - 1)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (language) {
        query = query.eq('language', language);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching community snippets:', error);
        return [];
      }

      // Transform the data to include author information
      return (data || []).map(snippet => ({
        ...snippet,
        author_name: snippet.profiles?.full_name || null,
        author_avatar: snippet.profiles?.avatar_url || null
      })) as CommunitySnippetWithProfile[];
    } catch (error) {
      console.error('Error fetching community snippets:', error);
      return [];
    }
  }

  // Get newest public snippets for homepage
  async getNewestCommunitySnippets(limit: number = 2): Promise<CommunitySnippetWithProfile[]> {
    return await this.getCommunitySnippets(limit, 0, undefined, undefined, undefined, 'created_at', 'desc');
  }

  // Increment view count
  async incrementViewCount(communityId: string): Promise<boolean> {
    try {
      // First get current count
      const { data: current, error: fetchError } = await this.supabase
        .from('community')
        .select('views_count')
        .eq('id', communityId)
        .single();

      if (fetchError || !current) {
        console.error('Error fetching current view count:', fetchError);
        return false;
      }

      // Update with incremented count
      const { error } = await this.supabase
        .from('community')
        .update({ 
          views_count: current.views_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', communityId);

      if (error) {
        console.error('Error incrementing view count:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }
  }

  // Toggle like on community snippet
  async toggleLike(communityId: string, userId: string): Promise<{ success: boolean; liked: boolean; likesCount: number }> {
    try {
      // Check if user has already liked this snippet
      const { data: existingLike } = await this.supabase
        .from('community_likes')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

      let liked = false;
      let likesCountDelta = 0;

      if (existingLike) {
        // Unlike - remove the like
        const { error: deleteError } = await this.supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error('Error removing like:', deleteError);
          return { success: false, liked: false, likesCount: 0 };
        }

        liked = false;
        likesCountDelta = -1;
      } else {
        // Like - add the like
        const { error: insertError } = await this.supabase
          .from('community_likes')
          .insert({
            community_id: communityId,
            user_id: userId
          });

        if (insertError) {
          console.error('Error adding like:', insertError);
          return { success: false, liked: false, likesCount: 0 };
        }

        liked = true;
        likesCountDelta = 1;
      }

      // Update the likes count in community table
      const { data: current, error: fetchError } = await this.supabase
        .from('community')
        .select('likes_count')
        .eq('id', communityId)
        .single();

      if (fetchError || !current) {
        console.error('Error fetching current likes count:', fetchError);
        return { success: false, liked, likesCount: 0 };
      }

      const newLikesCount = current.likes_count + likesCountDelta;

      const { data: updatedSnippet, error: updateError } = await this.supabase
        .from('community')
        .update({ 
          likes_count: newLikesCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', communityId)
        .select('likes_count')
        .single();

      if (updateError) {
        console.error('Error updating likes count:', updateError);
        return { success: false, liked, likesCount: 0 };
      }

      return { 
        success: true, 
        liked, 
        likesCount: updatedSnippet?.likes_count || 0 
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, liked: false, likesCount: 0 };
    }
  }

  // Get user's liked snippets
  async getUserLikes(userId: string, communityIds: string[]): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('community_likes')
        .select('community_id')
        .eq('user_id', userId)
        .in('community_id', communityIds);

      if (error) {
        console.error('Error fetching user likes:', error);
        return [];
      }

      return (data || []).map(like => like.community_id);
    } catch (error) {
      console.error('Error fetching user likes:', error);
      return [];
    }
  }

  // Get community statistics
  async getCommunityStats(): Promise<{ totalSnippets: number; totalLikes: number; totalViews: number }> {
    try {
      const [snippetsResult, likesResult, viewsResult] = await Promise.all([
        this.supabase.from('community').select('*', { count: 'exact', head: true }),
        this.supabase.from('community_likes').select('*', { count: 'exact', head: true }),
        this.supabase.from('community').select('views_count')
      ]);

      const totalSnippets = snippetsResult.count || 0;
      const totalLikes = likesResult.count || 0;
      const totalViews = viewsResult.data?.reduce((sum, row) => sum + (row.views_count || 0), 0) || 0;

      return { totalSnippets, totalLikes, totalViews };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      return { totalSnippets: 0, totalLikes: 0, totalViews: 0 };
    }
  }

  // Search community snippets
  async searchCommunitySnippets(
    query: string,
    filters: {
      language?: string;
      tags?: string[];
      sortBy?: 'created_at' | 'likes_count' | 'views_count';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<CommunitySnippetWithProfile[]> {
    const { language, tags, sortBy = 'created_at', sortOrder = 'desc' } = filters;
    return await this.getCommunitySnippets(50, 0, query, language, tags, sortBy, sortOrder);
  }
}

// Create singleton instance
const communityService = new CommunityService();

// Export functions for easy use
export const toggleSnippetPublic = (snippetId: string, isPublic: boolean) => 
  communityService.toggleSnippetPublic(snippetId, isPublic);
export const getCommunitySnippets = (
  limit?: number, 
  offset?: number, 
  searchQuery?: string, 
  language?: string, 
  tags?: string[], 
  sortBy?: 'created_at' | 'likes_count' | 'views_count', 
  sortOrder?: 'asc' | 'desc'
) => communityService.getCommunitySnippets(limit, offset, searchQuery, language, tags, sortBy, sortOrder);
export const getNewestCommunitySnippets = (limit?: number) => 
  communityService.getNewestCommunitySnippets(limit);
export const incrementViewCount = (communityId: string) => 
  communityService.incrementViewCount(communityId);
export const toggleLike = (communityId: string, userId: string) => 
  communityService.toggleLike(communityId, userId);
export const getUserLikes = (userId: string, communityIds: string[]) => 
  communityService.getUserLikes(userId, communityIds);
export const getCommunityStats = () => 
  communityService.getCommunityStats();
export const searchCommunitySnippets = (query: string, filters?: any) => 
  communityService.searchCommunitySnippets(query, filters);

export default communityService;