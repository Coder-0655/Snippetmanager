"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Tag
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Snippet } from "@/lib/supabase";
import { CopyButton } from "@/components/copy-button";

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  showFullCode?: boolean;
}

export function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  showFullCode = false,
}: SnippetCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullCode);
  const [copySuccess, setCopySuccess] = useState(false);

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

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      ts: "bg-blue-500",
      js: "bg-yellow-500",
      tsx: "bg-cyan-500",
      jsx: "bg-green-500",
      python: "bg-green-600",
      go: "bg-cyan-600",
      rust: "bg-orange-600",
      bash: "bg-gray-600",
      json: "bg-gray-500",
    };
    return colors[language] || "bg-gray-500";
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover-lift glass-card">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getLanguageColor(snippet.language)}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate text-lg">{snippet.title}</h3>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(snippet.id, !isFavorite)}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  {isFavorite ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span className="font-mono uppercase">{snippet.language}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{codeLines.length} lines</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              title="Copy code"
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(snippet)}
              title="Edit snippet"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
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
              <Badge key={tag} className="text-xs bg-muted hover:bg-muted/80 transition-colors">
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
            <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded text-xs animate-fade-in">
              Copied!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}