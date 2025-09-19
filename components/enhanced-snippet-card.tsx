"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Eye, 
  Copy, 
  ExternalLink,
  Calendar,
  Code,
  Tag,
  Save,
  X,
  Check,
  Share2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Snippet } from "@/lib/supabase";
import { CopyButton } from "@/components/copy-button";
import { MonacoEditor } from "@/components/monaco-editor";
import { CollaborationHub } from "@/components/collaboration-hub";
import { updateSnippet } from "@/lib/snippets";

interface EnhancedSnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showFullCode?: boolean;
  onUpdate?: (snippet: Snippet) => void;
}

export function EnhancedSnippetCard({
  snippet,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  showFullCode = false,
  onUpdate,
}: EnhancedSnippetCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullCode);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [editData, setEditData] = useState({
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
    tags: snippet.tags.join(", "),
  });
  const [saving, setSaving] = useState(false);

  const codeLines = snippet.code.split("\n");
  const displayCode = isExpanded ? snippet.code : codeLines.slice(0, 8).join("\n");
  const hasMoreLines = codeLines.length > 8;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStartEdit = () => {
    setEditData({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(", "),
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags.join(", "),
    });
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const updatedSnippet = await updateSnippet(snippet.id, {
        title: editData.title,
        code: editData.code,
        language: editData.language,
        tags: editData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      });
      
      if (onUpdate) {
        onUpdate(updatedSnippet);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update snippet:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Snippet title"
                className="text-lg font-semibold"
              />
              <Input
                value={editData.tags}
                onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags (comma separated)"
                className="text-sm"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveEdit}
                disabled={saving}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <MonacoEditor
            value={editData.code}
            onChange={(value) => setEditData(prev => ({ ...prev, code: value }))}
            language={editData.language}
            height="300px"
            onLanguageChange={(lang) => setEditData(prev => ({ ...prev, language: lang }))}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight truncate">
                {snippet.title}
              </h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                <Code className="h-2.5 w-2.5 mr-1" />
                {snippet.language.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
              </div>
              {snippet.updated_at !== snippet.created_at && (
                <div className="flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  Updated {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton
              text={snippet.code}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            />
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(snippet.id, !isFavorite)}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-yellow-500"
              >
                {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              title="Edit snippet inline"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(snippet)}
              title="Edit in modal"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaboration(!showCollaboration)}
              title="Share and collaborate"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(snippet.id)}
              title="Delete snippet"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {snippet.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="relative">
          <div className="border border-border rounded-lg bg-muted/20 p-4 font-mono text-sm overflow-auto">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed">
              {displayCode}
              {!isExpanded && hasMoreLines && (
                <span className="text-muted-foreground">
                  \n... ({codeLines.length - 8} more lines)
                </span>
              )}
            </pre>
          </div>
          
          {hasMoreLines && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 h-7 text-xs"
            >
              {isExpanded ? "Show Less" : `Show All (${codeLines.length} lines)`}
            </Button>
          )}
          
          {copySuccess && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs animate-fade-in">
              Copied!
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Collaboration Hub */}
      {showCollaboration && (
        <div className="border-t p-4">
          <CollaborationHub 
            snippet={snippet}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </Card>
  );
}