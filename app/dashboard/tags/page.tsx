"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getAllTagsFromSnippets, getSnippetsByTag } from "@/lib/snippets";
import type { Snippet } from "@/lib/supabase";

export default function TagsPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (filter) {
      loadFilteredSnippets(filter);
    } else {
      setFilteredSnippets([]);
    }
  }, [filter]);

  const loadTags = async () => {
    try {
      const data = await getAllTagsFromSnippets();
      setTags(data);
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

  if (loading) {
    return <div className="text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tags</h1>
        {filter && (
          <button
            onClick={() => setFilter(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear filter
          </button>
        )}
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tags found. Add some snippets with tags to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => setFilter(filter === tag ? null : tag)}
                className={`inline-flex items-center gap-1 ${
                  filter === tag ? "bg-primary text-primary-foreground" : "bg-secondary"
                } rounded-md px-3 py-1 text-sm hover:opacity-80`}
              >
                {tag}
                <span className="text-xs opacity-70">{count}</span>
              </button>
            ))}
          </div>

          {filter && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium">
                Snippets tagged with &ldquo;{filter}&rdquo; ({filteredSnippets.length})
              </h2>
              <div className="grid gap-3">
                {filteredSnippets.map((snippet) => (
                  <div key={snippet.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{snippet.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {snippet.language.toUpperCase()} •{" "}
                          {new Date(snippet.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {snippet.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 bg-muted/50 rounded-md p-3 font-mono text-sm max-h-32 overflow-auto">
                      <pre className="whitespace-pre-wrap">
                        {snippet.code.split("\n").slice(0, 5).join("\n")}
                        {snippet.code.split("\n").length > 5 && "\n..."}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
