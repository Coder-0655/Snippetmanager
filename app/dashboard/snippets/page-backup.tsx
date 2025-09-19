"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodeEditor, type CodeLanguage } from "@/components/code-editor";
import { Plus } from "lucide-react";
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from "@/lib/snippets";
import type { Snippet } from "@/lib/supabase";
import { AdvancedSearch, type SearchFilters } from "@/components/advanced-search";
import { SnippetCard } from "@/components/snippet-card";

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

export default function MySnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("ts");
  const [tags, setTags] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Advanced search filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    languages: [],
    tags: [],
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Get available tags from all snippets
  const availableTags = useMemo(() => {
    const allTags = snippets.flatMap(snippet => snippet.tags);
    return [...new Set(allTags)].sort();
  }, [snippets]);

  // Filter and sort snippets based on search filters
  const filteredAndSortedSnippets = useMemo(() => {
    let filtered = snippets;

    // Apply text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(query) ||
          snippet.code.toLowerCase().includes(query) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply language filters
    if (filters.languages.length > 0) {
      filtered = filtered.filter(snippet => 
        filters.languages.includes(snippet.language as CodeLanguage)
      );
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      filtered = filtered.filter(snippet =>
        filters.tags.some(tag => snippet.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "language":
          comparison = a.language.localeCompare(b.language);
          break;
        case "updated_at":
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "created_at":
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [snippets, filters]);

  useEffect(() => {
    loadSnippets();
    loadFavorites();
  }, []);

  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data);
    } catch (error) {
      console.error("Failed to load snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem("snippet-favorites");
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const saveFavorites = (newFavorites: Set<string>) => {
    try {
      localStorage.setItem("snippet-favorites", JSON.stringify([...newFavorites]));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const toggleFavorite = (id: string, isFavorite: boolean) => {
    const newFavorites = new Set(favorites);
    if (isFavorite) {
      newFavorites.add(id);
    } else {
      newFavorites.delete(id);
    }
    saveFavorites(newFavorites);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim()) return;

    setSubmitting(true);
    try {
      const snippetData = {
        title: title.trim(),
        code: code.trim(),
        language,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingSnippet) {
        const updated = await updateSnippet(editingSnippet.id, snippetData);
        setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const newSnippet = await createSnippet(snippetData);
        setSnippets((prev) => [newSnippet, ...prev]);
      }

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Failed to save snippet:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setLanguage(snippet.language as CodeLanguage);
    setTags(snippet.tags.join(", "));
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;

    try {
      await deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      // Remove from favorites if it was favorited
      const newFavorites = new Set(favorites);
      newFavorites.delete(id);
      saveFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to delete snippet:", error);
    }
  };

  const resetForm = () => {
    setEditingSnippet(null);
    setTitle("");
    setCode("");
    setLanguage("ts");
    setTags("");
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Snippets</h1>
          <p className="text-muted-foreground">Manage your code snippets</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSnippet ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
              <DialogDescription>
                {editingSnippet
                  ? "Update your code snippet details below."
                  : "Create a new code snippet to save for later use."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Snippet title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-ring"
              />
              <Select value={language} onValueChange={(value: CodeLanguage) => setLanguage(value)}>
                <SelectTrigger className="focus-ring">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                placeholder="Enter your code here..."
                className="min-h-[300px] focus-ring"
              />
              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="focus-ring"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !code.trim()}
                  className="flex-1 btn-primary"
                >
                  {submitting ? "Saving..." : editingSnippet ? "Update" : "Save"}
                </Button>
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AdvancedSearch
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        resultsCount={filteredAndSortedSnippets.length}
      />

      {filteredAndSortedSnippets.length === 0 ? (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            {filters.query || filters.languages.length > 0 || filters.tags.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium">No snippets found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters or create a new snippet
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium">No snippets yet</h3>
                <p className="text-muted-foreground">
                  Create your first snippet to get started
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAndSortedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={toggleFavorite}
              isFavorite={favorites.has(snippet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}