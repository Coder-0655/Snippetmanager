"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getSnippets, getAllTagsFromSnippets } from "@/lib/snippets";
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Plus, Clock, Tag, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import type { UnifiedSnippet } from "@/lib/snippets";
import { AnalyticsOverlay } from "@/components/analytics-overlay";

export default function DashboardHome() {
  const { user } = useUser();
  const [recentSnippets, setRecentSnippets] = useState<UnifiedSnippet[]>([]);
  const [allSnippets, setAllSnippets] = useState<UnifiedSnippet[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [topTags, setTopTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load snippets
      const snippets = await getSnippets(user?.id);
      setRecentSnippets(snippets.slice(0, 5));
      setAllSnippets(snippets);
      
      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const thisWeek = snippets.filter(s => new Date(s.created_at) > weekAgo).length;
      const thisMonth = snippets.filter(s => new Date(s.created_at) > monthAgo).length;
      
      setStats({
        total: snippets.length,
        thisWeek,
        thisMonth,
      });
      
      // Load top tags
      const tags = await getAllTagsFromSnippets();
      setTopTags(tags.slice(0, 8));
      
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAnalytics = (period: "week" | "month") => {
    setAnalyticsPeriod(period);
    setAnalyticsOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Developer'}!</h1>
          <p className="text-muted-foreground">
            Manage your code snippets and boost your productivity
          </p>
        </div>
        <Link href="/dashboard/snippets">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Snippet
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ModernCard variant="elevated" animate>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Snippets</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard 
          variant="elevated" 
          animate 
          className="cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => openAnalytics("week")}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-xs text-muted-foreground mt-1">Click for details</p>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard 
          variant="elevated" 
          animate 
          className="cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => openAnalytics("month")}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground mt-1">Click for details</p>
            </div>
          </div>
        </ModernCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Snippets */}
        <ModernCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Recent Snippets</h2>
          </div>
          <div className="space-y-3">
            {recentSnippets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No snippets yet. Create your first one!
              </p>
            ) : (
              recentSnippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{snippet.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {snippet.language.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(snippet.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href="/dashboard/snippets">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
          {recentSnippets.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/dashboard/snippets">
                <Button variant="outline" className="w-full">
                  View All Snippets
                </Button>
              </Link>
            </div>
          )}
        </ModernCard>

        {/* Top Tags */}
        <ModernCard variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Popular Tags</h2>
          </div>
          <div className="space-y-3">
            {topTags.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tags yet. Add tags to your snippets!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topTags.map(({ tag, count }) => (
                  <Link key={tag} href={`/dashboard/tags?filter=${tag}`}>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag} ({count})
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {topTags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/dashboard/tags">
                <Button variant="outline" className="w-full">
                  Manage Tags
                </Button>
              </Link>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Quick Actions */}
      <ModernCard variant="glass" className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/snippets">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New Snippet
            </Button>
          </Link>
          <Link href="/dashboard/tags">
            <Button variant="outline" className="w-full gap-2">
              <Tag className="h-4 w-4" />
              Browse Tags
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" className="w-full gap-2">
              <Star className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button variant="outline" className="w-full gap-2" onClick={() => window.location.reload()}>
            <TrendingUp className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </ModernCard>

      {/* Analytics Overlay */}
      <AnalyticsOverlay
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        snippets={allSnippets}
        period={analyticsPeriod}
      />
    </div>
  );
}
