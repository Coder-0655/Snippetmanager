"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernCard } from "@/components/ui/modern-card";
import { 
  Tag, 
  Search, 
  Hash, 
  TrendingUp, 
  Filter,
  Plus,
  X,
  Edit,
  Trash2,
  BarChart3,
  Grid3X3,
  List
} from "lucide-react";
import { getAllTagsFromSnippets, getSnippetsByTag, getSnippets, updateSnippet, deleteSnippet, DEFAULT_TAGS } from "@/lib/snippets";
import { EnhancedSnippetCard } from "@/components/enhanced-snippet-card";
import type { Snippet } from "@/lib/supabase";

interface TagData {
  tag: string;
  count: number;
  lastUsed: string;
  color?: string;
}

export default function TagsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<TagData[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent'>('count');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  // Load data
  useEffect(() => {
    if (user) {
      loadTags();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTag) {
      loadFilteredSnippets(selectedTag);
    } else {
      setFilteredSnippets([]);
    }
  }, [selectedTag, user]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const tagData = await getAllTagsFromSnippets();
      const snippets = await getSnippets(user?.id);
      
      // Get default tags that might not have snippets yet
      const defaultTagsData = DEFAULT_TAGS.map(defaultTag => {
        const existingTag = tagData.find(t => t.tag === defaultTag.name);
        return {
          tag: defaultTag.name,
          count: existingTag?.count || 0,
          lastUsed: existingTag ? 
            snippets.filter(s => s.tags.includes(defaultTag.name))
              .reduce((latest, s) => Math.max(latest, new Date(s.updated_at).getTime()), 0) : 
            Date.now(),
          color: defaultTag.color
        };
      });

      // Add any additional custom tags
      const customTags = tagData
        .filter(t => !DEFAULT_TAGS.some(dt => dt.name === t.tag))
        .map(({ tag, count }) => {
          const snippetsWithTag = snippets.filter(s => s.tags.includes(tag));
          const lastUsed = snippetsWithTag.length > 0 
            ? Math.max(...snippetsWithTag.map(s => new Date(s.updated_at).getTime()))
            : Date.now();
          
          return {
            tag,
            count,
            lastUsed: new Date(lastUsed).toISOString(),
            color: getTagColor(tag)
          };
        });

      // Combine default and custom tags
      const allTags = [
        ...defaultTagsData.map(t => ({ ...t, lastUsed: new Date(t.lastUsed).toISOString() })),
        ...customTags
      ];
      
      setTags(allTags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredSnippets = async (tag: string) => {
    try {
      const data = await getSnippetsByTag(tag);
      setFilteredSnippets(data);
    } catch (error) {
      console.error("Failed to load filtered snippets:", error);
    }
  };

  // Generate consistent colors for tags
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700',
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700',
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:border-pink-700',
      'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700'
    ];
    
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Filter and sort tags
  const filteredAndSortedTags = useMemo(() => {
    let filtered = tags;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.tag.toLowerCase().includes(query)
      );
    }

    // Sort tags
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.tag.localeCompare(b.tag);
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'count':
        default:
          return b.count - a.count;
      }
    });

    return filtered;
  }, [tags, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const totalTags = tags.length;
    const totalUsage = tags.reduce((sum, tag) => sum + tag.count, 0);
    const averageUsage = totalTags > 0 ? Math.round(totalUsage / totalTags) : 0;
    const mostUsedTag = tags.reduce((max, tag) => tag.count > max.count ? tag : max, { tag: '', count: 0 });

    return { totalTags, totalUsage, averageUsage, mostUsedTag };
  }, [tags]);

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    // For now, we'll just add it to the local state
    // In a real implementation, you'd create a snippet with this tag or update existing ones
    setNewTagName("");
    setIsCreatingTag(false);
    
    // Refresh tags to get the updated list
    await loadTags();
  };

  const deleteTag = async (tagToDelete: string) => {
    if (!confirm(`Are you sure you want to remove the tag "${tagToDelete}" from all snippets?`)) {
      return;
    }

    try {
      // Get all snippets with this tag and update them
      const snippetsWithTag = await getSnippetsByTag(tagToDelete);
      
      await Promise.all(snippetsWithTag.map(async (snippet) => {
        const updatedTags = snippet.tags.filter(tag => tag !== tagToDelete);
        await updateSnippet(snippet.id, { tags: updatedTags });
      }));

      // Refresh the tags list
      await loadTags();
      
      // If this was the selected tag, clear the selection
      if (selectedTag === tagToDelete) {
        setSelectedTag(null);
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const handleSnippetUpdate = (updatedSnippet: Snippet) => {
    setFilteredSnippets(prev => 
      prev.map(snippet => 
        snippet.id === updatedSnippet.id ? updatedSnippet : snippet
      )
    );
    // Refresh tags in case tags were changed
    loadTags();
  };

  const handleSnippetDelete = async (snippetId: string) => {
    try {
      await deleteSnippet(snippetId);
      setFilteredSnippets(prev => prev.filter(s => s.id !== snippetId));
      // Refresh tags in case this was the last snippet with certain tags
      loadTags();
    } catch (error) {
      console.error("Failed to delete snippet:", error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            Tag Management
          </h1>
          <p className="text-muted-foreground">
            Organize and manage your snippet tags
          </p>
        </div>
        <Button
          onClick={() => setIsCreatingTag(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Tag
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <ModernCard variant="elevated" animate>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tags</p>
              <p className="text-2xl font-bold">{stats.totalTags}</p>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard variant="elevated" animate>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <p className="text-2xl font-bold">{stats.totalUsage}</p>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard variant="elevated" animate>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Usage</p>
              <p className="text-2xl font-bold">{stats.averageUsage}</p>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard variant="elevated" animate>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Tag className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Used</p>
              <p className="text-lg font-bold truncate">
                {stats.mostUsedTag.tag || 'None'}
              </p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-background border border-border rounded-md text-sm"
          >
            <option value="count">By Usage</option>
            <option value="name">By Name</option>
            <option value="recent">By Recent</option>
          </select>
          
          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Tag Modal */}
      {isCreatingTag && (
        <ModernCard variant="elevated" className="p-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createTag()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={createTag} disabled={!newTagName.trim()}>
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingTag(false);
                setNewTagName("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </ModernCard>
      )}

      {/* Tags Display */}
      <div className="space-y-4">
        {filteredAndSortedTags.length === 0 ? (
          <ModernCard variant="glass" className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tags found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search" : "Create your first tag to get started"}
            </p>
          </ModernCard>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {filteredAndSortedTags.map((tagData) => (
                  <ModernCard
                    key={tagData.tag}
                    variant="elevated"
                    animate
                    className={`cursor-pointer transition-all ${
                      selectedTag === tagData.tag ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTag(selectedTag === tagData.tag ? null : tagData.tag)}
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={tagData.color}>
                          {tagData.tag}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTag(tagData.tag);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>{tagData.count} snippets</span>
                          <span>
                            {new Date(tagData.lastUsed).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))}
              </div>
            ) : (
              <ModernCard variant="elevated">
                <div className="divide-y">
                  {filteredAndSortedTags.map((tagData) => (
                    <div
                      key={tagData.tag}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTag === tagData.tag ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedTag(selectedTag === tagData.tag ? null : tagData.tag)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={tagData.color}>
                            {tagData.tag}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {tagData.count} snippets
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Last used {new Date(tagData.lastUsed).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTag(tagData.tag);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModernCard>
            )}
          </>
        )}
      </div>

      {/* Filtered Snippets */}
      {selectedTag && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Snippets tagged with "{selectedTag}"
            </h2>
            <Badge variant="secondary">
              {filteredSnippets.length} snippets
            </Badge>
          </div>
          
          {filteredSnippets.length === 0 ? (
            <ModernCard variant="glass" className="text-center py-8">
              <p className="text-muted-foreground">No snippets found with this tag</p>
            </ModernCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {filteredSnippets.map((snippet) => (
                <EnhancedSnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onEdit={() => {}} // Handle in the card itself
                  onDelete={handleSnippetDelete}
                  onUpdate={handleSnippetUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
