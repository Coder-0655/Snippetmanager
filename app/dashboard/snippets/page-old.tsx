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
  const { searchQuery } = useSearch();

  // Filter snippets based on search query
  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) return snippets;

    return snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [snippets, searchQuery]);

  useEffect(() => {
    loadSnippets();
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
    } catch (error) {
      console.error("Failed to delete snippet:", error);
    }
  };

  const resetForm = () => {
    setOpen(false);
    setEditingSnippet(null);
    setTitle("");
    setCode("");
    setLanguage("ts");
    setTags("");
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading snippets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">My Snippets</h1>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredSnippets.length} result{filteredSnippets.length !== 1 ? "s" : ""} for &ldquo;
              {searchQuery}&rdquo;
            </p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              />
              <Select value={language} onValueChange={(value: CodeLanguage) => setLanguage(value)}>
                <SelectTrigger>
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
                className="min-h-[200px]"
              />
              <Input
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !code.trim()}
                  className="flex-1"
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

      {filteredSnippets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? (
            <p>No snippets found matching &ldquo;{searchQuery}&rdquo;</p>
          ) : (
            <p>No snippets yet. Create your first one!</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{snippet.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {snippet.language.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <CopyButton text={snippet.code} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(snippet)}
                      title="Edit snippet"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(snippet.id)}
                      title="Delete snippet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {snippet.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {snippet.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border-t border-border -mx-6 -mb-6 bg-muted/50 p-4 font-mono text-sm overflow-auto max-h-48">
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm">
                    {snippet.code.split("\n").slice(0, 8).join("\n")}
                    {snippet.code.split("\n").length > 8 && "\n..."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
