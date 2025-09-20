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

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-background to-muted/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 shadow-sm">
      {/* Language indicator stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getLanguageColor(snippet.language)}`} />
      
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight truncate text-foreground">{snippet.title}</h3>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(snippet.id, !isFavorite)}
                  className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:text-amber-500"
                >
                  {isFavorite ? (
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" />
                <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-muted/80 hover:bg-muted transition-colors">
                  {snippet.language.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">{codeLines.length} lines</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              title="Copy code"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(snippet)}
              title="Edit snippet"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(snippet.id)}
              title="Delete snippet"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
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
          <div className="border border-muted/40 rounded-xl bg-muted/10 backdrop-blur-sm p-4 font-mono text-sm overflow-hidden group/code">
            <div className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur">
                {snippet.language}
              </Badge>
            </div>
            
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 pr-16">
              <code>
                {displayCode}
                {!isExpanded && hasMoreLines && (
                  <span className="text-muted-foreground/70 italic">
                    \n\n... {codeLines.length - 8} more lines
                  </span>
                )}
              </code>
            </pre>
          </div>
          
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
          
          {copySuccess && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                Copied!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}