"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
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
import { MonacoEditor } from "@/components/monaco-editor";
import { Plus, Upload, Crown } from "lucide-react";
import { getSnippets, createSnippet, updateSnippet, deleteSnippet, type UnifiedSnippet } from "@/lib/snippets";
import { getProjects } from "@/lib/projects";
import { canCreatePrivateSnippets } from "@/lib/subscription";
import { toggleSnippetPublic } from "@/lib/community";
import type { Snippet } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import { AdvancedSearch, type SearchFilters } from "@/components/advanced-search";
import { EnhancedSnippetCard } from "@/components/enhanced-snippet-card";
import { BulkOperations, SelectionCheckbox } from "@/components/bulk-operations";
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts";
import { SnippetExporter, SnippetImporter } from "@/lib/snippet-export";
import { MediaUpload } from "@/components/media-upload";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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
  const { user } = useUser();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [projects, setProjects] = useState<Database['public']['Tables']['projects']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("ts");
  const [tags, setTags] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("none");
  const [isPublic, setIsPublic] = useState(true);
  const [canCreatePrivate, setCanCreatePrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedSnippets, setSelectedSnippets] = useState<Set<string>>(new Set());
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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

  // Load projects from database
  useEffect(() => {
    const loadProjects = async () => {
      if (user) {
        try {
          const projectsData = await getProjects(user.id);
          setProjects(projectsData);
        } catch (error) {
          console.error('Failed to load projects:', error);
        }
      }
    };
    loadProjects();
  }, [user]);

  // Check subscription permissions
  useEffect(() => {
    const checkPrivateSnippetPermission = async () => {
      if (!user) return;
      try {
        const canCreate = await canCreatePrivateSnippets(user.id);
        setCanCreatePrivate(canCreate);
        // If user can't create private snippets, force public
        if (!canCreate) {
          setIsPublic(true);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    checkPrivateSnippetPermission();
  }, [user]);

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

  // Keyboard shortcuts
  const shortcuts = useMemo(() => [
    {
      keys: ["mod", "n"],
      description: "Create new snippet",
      action: () => {
        resetForm();
        setOpen(true);
      },
    },
    {
      keys: ["mod", "k"],
      description: "Focus search",
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      keys: ["mod", "a"],
      description: "Select all snippets",
      action: () => {
        if (selectedSnippets.size === filteredAndSortedSnippets.length) {
          setSelectedSnippets(new Set());
        } else {
          setSelectedSnippets(new Set(filteredAndSortedSnippets.map(s => s.id)));
        }
      },
    },
    {
      keys: ["escape"],
      description: "Close dialog or clear selection",
      action: () => {
        if (open) {
          setOpen(false);
        } else if (selectedSnippets.size > 0) {
          setSelectedSnippets(new Set());
        }
      },
    },
    {
      keys: ["mod", "e"],
      description: "Export selected snippets",
      action: () => {
        if (selectedSnippets.size > 0) {
          handleExportSelected();
        }
      },
    },
  ], [open, selectedSnippets, filteredAndSortedSnippets]);

  useKeyboardShortcuts({ shortcuts });

  useEffect(() => {
    loadSnippets();
    loadFavorites();
  }, []);

  const loadSnippets = async () => {
    try {
      const data = await getSnippets(user?.id);
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
    setError("");
    try {
      const snippetData = {
        title: title.trim(),
        code: code.trim(),
        language,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        project_id: projectId === "none" ? null : projectId,
      };

      if (editingSnippet) {
        const updated = await updateSnippet(editingSnippet.id, snippetData);
        setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const newSnippet = await createSnippet(snippetData, user?.id);
        setSnippets((prev) => [newSnippet, ...prev]);
      }

      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to save snippet:", error);
      if (error.message && error.message.includes('subscription limits')) {
        setError(error.message);
      } else if (error.message && error.message.includes('maximum')) {
        setError(error.message);
      } else {
        setError('Failed to save snippet. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublic = async (snippetId: string, newIsPublic: boolean) => {
    if (!user) return;

    // Check if user is trying to make snippet private without permission
    if (!newIsPublic && !canCreatePrivate) {
      alert("Private snippets are only available for PRO users. Please upgrade your plan to make snippets private.");
      return;
    }

    try {
      const success = await toggleSnippetPublic(snippetId, newIsPublic);
      if (success) {
        // Refresh snippets to get updated data
        loadSnippets();
      }
    } catch (error) {
      console.error('Error toggling snippet privacy:', error);
      alert('Failed to update snippet privacy. Please try again.');
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setLanguage(snippet.language as CodeLanguage);
    setTags(snippet.tags.join(", "));
    setProjectId((snippet as any).project_id || "none");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;

    try {
      await deleteSnippet(id);
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      // Remove from favorites and selection
      const newFavorites = new Set(favorites);
      newFavorites.delete(id);
      saveFavorites(newFavorites);
      setSelectedSnippets(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
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
    setProjectId("none");
    setError("");
  };

  // Bulk operations
  const handleSelectAll = () => {
    setSelectedSnippets(new Set(filteredAndSortedSnippets.map(s => s.id)));
  };

  const handleDeselectAll = () => {
    setSelectedSnippets(new Set());
  };

  const handleDeleteSelected = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => deleteSnippet(id)));
      setSnippets(prev => prev.filter(s => !ids.includes(s.id)));
      setSelectedSnippets(new Set());
      
      // Remove from favorites
      const newFavorites = new Set(favorites);
      ids.forEach(id => newFavorites.delete(id));
      saveFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to delete snippets:", error);
    }
  };

  const handleExportSelected = () => {
    const selectedSnippetObjects = snippets.filter(s => selectedSnippets.has(s.id));
    const timestamp = new Date().toISOString().split('T')[0];
    SnippetExporter.downloadExport(
      selectedSnippetObjects,
      `snippets-export-${timestamp}.json`,
      { format: "json", includeMetadata: true }
    );
  };

  const handleToggleFavoritesSelected = (ids: string[], isFavorite: boolean) => {
    const newFavorites = new Set(favorites);
    ids.forEach(id => {
      if (isFavorite) {
        newFavorites.add(id);
      } else {
        newFavorites.delete(id);
      }
    });
    saveFavorites(newFavorites);
  };

  const handleAddTagsToSelected = async (ids: string[], newTags: string[]) => {
    try {
      const updates = snippets
        .filter(s => ids.includes(s.id))
        .map(snippet => ({
          ...snippet,
          tags: [...new Set([...snippet.tags, ...newTags])],
        }));

      await Promise.all(
        updates.map(snippet => 
          updateSnippet(snippet.id, {
            title: snippet.title,
            code: snippet.code,
            language: snippet.language,
            tags: snippet.tags,
          })
        )
      );

      setSnippets(prev => 
        prev.map(snippet => 
          updates.find(u => u.id === snippet.id) || snippet
        )
      );
    } catch (error) {
      console.error("Failed to add tags:", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedSnippets = await SnippetImporter.importFromFile(file);
      
      // Create all imported snippets
      const createdSnippets = await Promise.all(
        importedSnippets.map(snippet => 
          createSnippet({
            title: snippet.title,
            code: snippet.code,
            language: snippet.language,
            tags: snippet.tags,
          })
        )
      );

      setSnippets(prev => [...createdSnippets, ...prev]);
      setImportDialogOpen(false);
      
      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Failed to import snippets:", error);
      alert("Failed to import snippets. Please check the file format.");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedSnippets(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
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
        
        <div className="flex items-center gap-2">
          <KeyboardShortcutsHelp shortcuts={shortcuts} />
          
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
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
                  required
                />
                
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="focus-ring">
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MonacoEditor
                  key={`editor-${open}-${editingSnippet?.id || 'new'}`}
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="300px"
                />
                <Select value={language} onValueChange={(value: CodeLanguage) => setLanguage(value)}>
                  <SelectTrigger className="focus-ring">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (optional)</label>
                  <Select value="" onValueChange={(value) => {
                    if (value && !tags.includes(value)) {
                      const newTags = tags ? `${tags}, ${value}` : value;
                      setTags(newTags);
                    }
                  }}>
                    <SelectTrigger className="focus-ring">
                      <SelectValue placeholder="Add tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tags && (
                    <div className="flex flex-wrap gap-1">
                      {tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200"
                          onClick={() => {
                            const tagList = tags.split(",").map(t => t.trim());
                            tagList.splice(index, 1);
                            setTags(tagList.join(", "));
                          }}
                        >
                          {tag.trim()} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public/Private Toggle */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Snippet Visibility
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {isPublic 
                          ? "This snippet will be visible in the community hub" 
                          : canCreatePrivate 
                            ? "This snippet will be private and only visible to you"
                            : "Private snippets require a PRO subscription"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isPublic ? 'text-muted-foreground' : 'font-medium'}`}>
                        Private
                      </span>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={(checked) => {
                          if (!checked && !canCreatePrivate) {
                            alert("Private snippets are only available for PRO users. Please upgrade your plan.");
                            return;
                          }
                          setIsPublic(checked);
                        }}
                      />
                      <span className={`text-sm ${isPublic ? 'font-medium' : 'text-muted-foreground'}`}>
                        Public
                      </span>
                    </div>
                  </div>
                  
                  {!canCreatePrivate && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <Crown className="h-3 w-3" />
                      <span>Upgrade to PRO to create private snippets</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Media Upload Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Media Attachments (Optional)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Add images or videos to provide visual context for your code snippet
                  </p>
                  <MediaUpload
                    value={[]}
                    onChange={() => {}}
                    maxFiles={3}
                    maxFileSize={5}
                    disabled={false}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !title.trim() || !code.trim() || !language}
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
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Snippets</DialogTitle>
            <DialogDescription>
              Select a JSON file to import snippets from.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="focus-ring"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: JSON files exported from this app or compatible formats.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AdvancedSearch
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        resultsCount={filteredAndSortedSnippets.length}
      />

      {selectedSnippets.size > 0 && (
        <BulkOperations
          selectedSnippets={selectedSnippets}
          allSnippets={filteredAndSortedSnippets}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={() => handleExportSelected()}
          onToggleFavorites={handleToggleFavoritesSelected}
          onAddTagsToSelected={handleAddTagsToSelected}
        />
      )}

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
            <div key={snippet.id} className="relative">
              <div className="absolute top-2 left-2 z-10">
                <SelectionCheckbox
                  isSelected={selectedSnippets.has(snippet.id)}
                  onToggle={() => toggleSelection(snippet.id)}
                />
              </div>
              <EnhancedSnippetCard
                snippet={snippet}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                onTogglePublic={handleTogglePublic}
                isFavorite={favorites.has(snippet.id)}
                onUpdate={(updatedSnippet) => {
                  setSnippets(prev => prev.map(s => s.id === updatedSnippet.id ? updatedSnippet : s));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}