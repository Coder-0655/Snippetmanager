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

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      ts: "bg-gradient-to-r from-blue-500 to-blue-600",
      tsx: "bg-gradient-to-r from-blue-400 to-cyan-500",
      js: "bg-gradient-to-r from-yellow-400 to-yellow-500",
      jsx: "bg-gradient-to-r from-green-400 to-emerald-500",
      python: "bg-gradient-to-r from-green-500 to-green-600",
      go: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      rust: "bg-gradient-to-r from-orange-500 to-red-500",
      bash: "bg-gradient-to-r from-gray-500 to-gray-600",
      json: "bg-gradient-to-r from-gray-400 to-gray-500",
      css: "bg-gradient-to-r from-blue-400 to-purple-500",
      html: "bg-gradient-to-r from-orange-400 to-red-500",
      sql: "bg-gradient-to-r from-purple-500 to-purple-600",
    };
    return colors[language.toLowerCase()] || "bg-gradient-to-r from-gray-400 to-gray-500";
  };

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
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        <CardHeader className="pb-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Snippet title"
                  className="text-lg font-semibold border-muted-foreground/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <Input
                  value={editData.tags}
                  onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Tags (comma separated)"
                  className="text-sm border-muted-foreground/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                disabled={saving}
                className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
                className="h-9 px-4 border-muted-foreground/20 hover:bg-muted/50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Code</label>
            <div className="border border-muted-foreground/20 rounded-xl overflow-hidden">
              <MonacoEditor
                value={editData.code}
                onChange={(value) => setEditData(prev => ({ ...prev, code: value }))}
                language={editData.language}
                height="300px"
                onLanguageChange={(lang) => setEditData(prev => ({ ...prev, language: lang }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-sm">
      {/* Language indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getLanguageColor(snippet.language)}`} />
      
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and language badge */}
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight truncate text-foreground">
                {snippet.title}
              </h3>
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-1 bg-muted/80 hover:bg-muted transition-colors"
              >
                <Code className="h-3 w-3 mr-1" />
                {snippet.language.toUpperCase()}
              </Badge>
            </div>
            
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">{codeLines.length} lines</span>
              </div>
              
              {snippet.updated_at !== snippet.created_at && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Edit className="h-3.5 w-3.5" />
                  <span className="font-medium">Recently updated</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons - visible on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            <CopyButton
              text={snippet.code}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
            />
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(snippet.id, !isFavorite)}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all duration-200"
              >
                {isFavorite ? 
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : 
                  <StarOff className="h-4 w-4" />
                }
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              title="Edit snippet inline"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(snippet)}
              title="Edit in modal"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaboration(!showCollaboration)}
              title="Share and collaborate"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(snippet.id)}
              title="Delete snippet"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Tags */}
        {snippet.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {snippet.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-background/80 hover:bg-muted/80 transition-colors border-muted-foreground/20"
              >
                <Tag className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <div className="relative">
          {/* Code block with improved styling */}
          <div className="border border-muted/40 rounded-xl bg-muted/10 backdrop-blur-sm p-4 font-mono text-sm overflow-hidden group/code">
            <div className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur">
                {snippet.language}
              </Badge>
            </div>
            
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 pr-16">
              <code className="language-javascript">
                {displayCode}
                {!isExpanded && hasMoreLines && (
                  <span className="text-muted-foreground/70 italic">
                    \n\n... {codeLines.length - 8} more lines
                  </span>
                )}
              </code>
            </pre>
          </div>
          
          {/* Expand/collapse button */}
          {hasMoreLines && (
            <div className="flex justify-center mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 text-xs px-4 bg-muted/30 hover:bg-muted/60 border border-muted/40 rounded-full transition-all duration-200"
              >
                {isExpanded ? (
                  <>
                    <Eye className="h-3 w-3 mr-1.5" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1.5" />
                    Show All ({codeLines.length} lines)
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Copy success notification */}
          {copySuccess && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <Check className="h-3 w-3 mr-1 inline" />
              Copied!
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Collaboration Hub */}
      {showCollaboration && (
        <div className="border-t border-muted/30 bg-muted/10 p-4">
          <CollaborationHub 
            snippet={snippet}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </Card>
  );
}