'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Heart, Eye, Code2 } from 'lucide-react'
import { getNewestCommunitySnippets } from '@/lib/community'
import { CommunitySnippetWithProfile } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CommunitySnippetsSection() {
  const [snippets, setSnippets] = useState<CommunitySnippetWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNewestSnippets()
  }, [])

  const loadNewestSnippets = async () => {
    try {
      const data = await getNewestCommunitySnippets(6)
      setSnippets(data)
    } catch (error) {
      console.error('Error loading newest community snippets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="mt-12 lg:mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest Community Snippets</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-muted rounded w-12"></div>
                  <div className="h-5 bg-muted rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (snippets.length === 0) {
    return null
  }

  return (
    <section className="mt-12 lg:mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Latest Community Snippets</h2>
          <p className="text-muted-foreground">Discover and learn from the community</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/community" className="flex items-center gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <Card key={snippet.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {snippet.title}
                  </h3>
                  {snippet.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {snippet.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{snippet.author_name || 'Anonymous'}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Code Preview */}
              <div className="mb-3">
                <div className="rounded border border-border bg-muted/30 p-3">
                  <pre className="text-xs overflow-hidden">
                    <code className="text-muted-foreground">
                      {snippet.code.length > 80 
                        ? snippet.code.substring(0, 80) + '...'
                        : snippet.code
                      }
                    </code>
                  </pre>
                </div>
              </div>

              {/* Tags and Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {snippet.language && (
                    <Badge variant="secondary" className="text-xs">
                      <Code2 className="h-2 w-2 mr-1" />
                      {snippet.language}
                    </Badge>
                  )}
                  {snippet.tags && snippet.tags.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {snippet.tags[0]}
                    </Badge>
                  )}
                  {snippet.tags && snippet.tags.length > 1 && (
                    <span className="text-xs text-muted-foreground">
                      +{snippet.tags.length - 1}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{snippet.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{snippet.views_count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {snippets.length >= 6 && (
        <div className="text-center">
          <Button asChild>
            <Link href="/dashboard/community">
              Explore More Community Snippets
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}