"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";
import type { CodeLanguage } from "@/components/code-editor";

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "tsx", label: "TSX" },
  { value: "jsx", label: "JSX" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
];

export interface SearchFilters {
  query: string;
  languages: CodeLanguage[];
  tags: string[];
  sortBy: "title" | "created_at" | "updated_at" | "language";
  sortOrder: "asc" | "desc";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
  resultsCount: number;
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  availableTags,
  resultsCount,
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      languages: [],
      tags: [],
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  const toggleLanguage = (language: CodeLanguage) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...filters.languages, language];
    updateFilters({ languages: newLanguages });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const hasActiveFilters = 
    filters.query ||
    filters.languages.length > 0 ||
    filters.tags.length > 0 ||
    filters.sortBy !== "created_at" ||
    filters.sortOrder !== "desc";

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search snippets by title, content, or tags..."
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2"
          >
            <Filter className="h-3 w-3" />
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {resultsCount} snippet{resultsCount !== 1 ? "s" : ""}
          {filters.query && ` matching "${filters.query}"`}
        </p>
        
        {/* Quick sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [typeof filters.sortBy, typeof filters.sortOrder];
              updateFilters({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest</SelectItem>
              <SelectItem value="created_at-asc">Oldest</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
              <SelectItem value="language-asc">Language</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="glass-card p-4 rounded-lg space-y-4 animate-slide-down">
          {/* Language filters */}
          <div>
            <label className="text-sm font-medium mb-2 block">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = filters.languages.includes(lang.value);
                return (
                  <Button
                    key={lang.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLanguage(lang.value)}
                    className="h-7 text-xs"
                  >
                    {lang.label}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tag filters */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <Button
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="h-7 text-xs"
                    >
                      {tag}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Active Filters</label>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.languages.map((lang) => (
                <Badge key={lang} className="gap-1 bg-secondary text-secondary-foreground">
                  {LANGUAGES.find(l => l.value === lang)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleLanguage(lang)}
                  />
                </Badge>
                ))}
                {filters.tags.map((tag) => (
                <Badge key={tag} className="gap-1 bg-secondary text-secondary-foreground">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}