'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Heart, Eye, Clock, User, Tag } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { CommunitySnippetWithProfile } from '@/lib/supabase'
import { getCommunitySnippets, searchCommunitySnippets, toggleLike, getUserLikes } from '@/lib/community'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import SnippetPreview from '@/components/snippet-preview'

export default function CommunityPage() {
  const [snippets, setSnippets] = useState<CommunitySnippetWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'likes_count' | 'views_count'>('created_at')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [languages, setLanguages] = useState<string[]>([])
  const [userLikes, setUserLikes] = useState<string[]>([])
  const { user } = useUser()

  useEffect(() => {
    loadSnippets()
  }, [sortBy])

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      loadSnippets()
    }
  }, [searchQuery])

  useEffect(() => {
    if (user && snippets.length > 0) {
      loadUserLikes()
    }
  }, [user, snippets])

  const loadSnippets = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCommunitySnippets(50, 0, undefined, undefined, undefined, sortBy, 'desc')
      setSnippets(data)
      
      // Extract unique languages
      const uniqueLanguages = [...new Set(data.map(s => s.language).filter(Boolean))]
      setLanguages(uniqueLanguages)
    } catch (error) {
      console.error('Error loading community snippets:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy])

  const loadUserLikes = useCallback(async () => {
    if (!user || snippets.length === 0) return

    try {
      const communityIds = snippets.map(s => s.id)
      const likes = await getUserLikes(user.id, communityIds)
      setUserLikes(likes)
    } catch (error) {
      console.error('Error loading user likes:', error)
    }
  }, [user, snippets])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadSnippets()
      return
    }

    try {
      setLoading(true)
      const data = await searchCommunitySnippets(searchQuery, {
        language: selectedLanguage || undefined,
        sortBy,
        sortOrder: 'desc'
      })
      setSnippets(data)
    } catch (error) {
      console.error('Error searching snippets:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedLanguage, sortBy, loadSnippets])

  const handleLike = async (snippetId: string) => {
    if (!user) return

    try {
      const wasLiked = userLikes.includes(snippetId)
      const result = await toggleLike(snippetId, user.id)
      
      if (result.success) {
        // Update local state
        setSnippets(prev => prev.map(snippet => {
          if (snippet.id === snippetId) {
            return {
              ...snippet,
              likes_count: result.likesCount
            }
          }
          return snippet
        }))

        // Update user likes
        setUserLikes(prev => 
          wasLiked 
            ? prev.filter(id => id !== snippetId)
            : [...prev, snippetId]
        )
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const filteredSnippets = selectedLanguage 
    ? snippets.filter(snippet => snippet.language === selectedLanguage)
    : snippets

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Snippets</h1>
        <p className="text-muted-foreground">
          Discover and share code snippets with the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select
            value={sortBy}
            onValueChange={(value: 'created_at' | 'likes_count' | 'views_count') => setSortBy(value)}
          >
            <option value="created_at">Newest</option>
            <option value="views_count">Most Viewed</option>
            <option value="likes_count">Most Liked</option>
          </Select>

          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span>{filteredSnippets.length} snippets found</span>
        {searchQuery && (
          <span>for &quot;{searchQuery}&quot;</span>
        )}
        {selectedLanguage && (
          <Badge variant="secondary" className="text-xs">
            {selectedLanguage}
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Snippets Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {snippet.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {snippet.description}
                    </p>
                  </div>
                </div>

                {/* Author and metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{snippet.author_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Code Preview */}
                <div className="mb-4">
                  <SnippetPreview 
                    title={snippet.title}
                    code={snippet.code} 
                    language={snippet.language}
                    tags={snippet.tags}
                  />
                </div>

                {/* Tags */}
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {snippet.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {snippet.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{snippet.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{snippet.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{snippet.likes_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {snippet.language && (
                      <Badge variant="secondary" className="text-xs">
                        {snippet.language}
                      </Badge>
                    )}
                    
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(snippet.id)}
                        className={`h-8 w-8 p-0 ${userLikes.includes(snippet.id) ? 'text-red-500' : ''}`}
                      >
                        <Heart 
                          className={`h-4 w-4 ${userLikes.includes(snippet.id) ? 'fill-current' : ''}`} 
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSnippets.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No snippets found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No snippets match &quot;${searchQuery}&quot;`
              : "No public snippets available yet"
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}