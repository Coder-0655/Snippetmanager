"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Code2,
  TrendingUp,
  Tag,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
  X,
} from "lucide-react";
import { format, startOfWeek, startOfMonth, eachDayOfInterval, subWeeks, subMonths } from "date-fns";
import type { UnifiedSnippet } from "@/lib/snippets";

interface AnalyticsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: UnifiedSnippet[];
  period: "week" | "month";
}

interface ChartData {
  date: string;
  snippets: number;
  cumulative: number;
}

interface LanguageData {
  language: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for chart compatibility
}

interface TagData {
  tag: string;
  count: number;
}

const LANGUAGE_COLORS = {
  typescript: "#3178c6",
  javascript: "#f7df1e",
  tsx: "#61dafb",
  jsx: "#61dafb",
  python: "#3776ab",
  go: "#00add8",
  rust: "#ce422b",
  html: "#e34f26",
  css: "#1572b6",
  sql: "#336791",
  bash: "#4eaa25",
  json: "#000000",
  default: "#6b7280",
};

export function AnalyticsOverlay({ isOpen, onClose, snippets, period }: AnalyticsOverlayProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [tagData, setTagData] = useState<TagData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    growth: 0,
    avgPerDay: 0,
    mostActive: "",
  });

  useEffect(() => {
    if (isOpen && snippets.length > 0) {
      generateAnalytics();
    }
  }, [isOpen, snippets, period]);

  const generateAnalytics = () => {
    const now = new Date();
    const startDate = period === "week" 
      ? startOfWeek(now, { weekStartsOn: 1 }) 
      : startOfMonth(now);
    
    const endDate = now;
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Filter snippets for the period
    const periodSnippets = snippets.filter(snippet => {
      const snippetDate = new Date(snippet.created_at);
      return snippetDate >= startDate && snippetDate <= endDate;
    });

    // Generate daily chart data
    const dailyData: ChartData[] = days.map((day) => {
      const daySnippets = periodSnippets.filter(snippet => 
        format(new Date(snippet.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const cumulative = periodSnippets.filter(snippet => 
        new Date(snippet.created_at) <= day
      ).length;

      return {
        date: format(day, period === "week" ? 'EEE' : 'MMM dd'),
        snippets: daySnippets.length,
        cumulative,
      };
    });

    setChartData(dailyData);

    // Language distribution
    const languageCounts: Record<string, number> = {};
    periodSnippets.forEach(snippet => {
      languageCounts[snippet.language] = (languageCounts[snippet.language] || 0) + 1;
    });

    const languageStats: LanguageData[] = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / periodSnippets.length) * 100),
        color: LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] || LANGUAGE_COLORS.default,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setLanguageData(languageStats);

    // Tag distribution
    const tagCounts: Record<string, number> = {};
    periodSnippets.forEach(snippet => {
      snippet.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const tagStats: TagData[] = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setTagData(tagStats);

    // Calculate statistics
    const totalSnippets = periodSnippets.length;
    const daysInPeriod = days.length;
    const avgPerDay = Math.round((totalSnippets / daysInPeriod) * 10) / 10;
    
    // Previous period comparison
    const previousPeriodStart = period === "week" 
      ? subWeeks(startDate, 1)
      : subMonths(startDate, 1);
    const previousPeriodEnd = startDate;
    
    const previousPeriodSnippets = snippets.filter(snippet => {
      const snippetDate = new Date(snippet.created_at);
      return snippetDate >= previousPeriodStart && snippetDate < previousPeriodEnd;
    });

    const growth = previousPeriodSnippets.length > 0 
      ? Math.round(((totalSnippets - previousPeriodSnippets.length) / previousPeriodSnippets.length) * 100)
      : totalSnippets > 0 ? 100 : 0;

    // Most active day
    const mostActiveDay = dailyData.reduce((max, day) => 
      day.snippets > max.snippets ? day : max
    , dailyData[0]);

    setStats({
      total: totalSnippets,
      growth,
      avgPerDay,
      mostActive: mostActiveDay?.date || "N/A",
    });
  };

  const exportData = () => {
    const data = {
      period,
      stats,
      chartData,
      languageData,
      tagData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet-analytics-${period}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary animate-pulse" />
                {period === "week" ? "This Week" : "This Month"} Analytics
              </DialogTitle>
              <DialogDescription>
                Detailed insights into your snippet creation patterns and usage
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData} className="hover:scale-105 transition-transform">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:scale-105 transition-transform">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Created</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${stats.growth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {stats.growth > 0 && '+'}{stats.growth}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg per Day</p>
                    <p className="text-2xl font-bold">{stats.avgPerDay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Most Active</p>
                    <p className="text-lg font-bold">{stats.mostActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Activity Chart */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="snippets" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cumulative Growth */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cumulative Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Language Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="language"
                      label={({ language, percentage }) => `${language} (${percentage}%)`}
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Tags */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Top Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tagData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Language Details */}
          {languageData.length > 0 && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Language Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {languageData.map((lang) => (
                    <div key={lang.language} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{lang.language.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{lang.count} snippets</p>
                      </div>
                      <Badge variant="secondary">{lang.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tag Cloud */}
          {tagData.length > 0 && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tagData.map((tag) => (
                    <Badge 
                      key={tag.tag} 
                      variant="outline" 
                      className="text-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      style={{ 
                        fontSize: `${Math.min(16, 12 + (tag.count / Math.max(...tagData.map(t => t.count))) * 8)}px`
                      }}
                    >
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}