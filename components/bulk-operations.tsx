"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ChevronDown, 
  Trash2, 
  Download, 
  Upload, 
  Star, 
  Tag, 
  Copy,
  CheckSquare,
  Square
} from "lucide-react";
import type { Snippet } from "@/lib/supabase";

interface BulkOperationsProps {
  selectedSnippets: Set<string>;
  allSnippets: Snippet[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected: (ids: string[]) => Promise<void>;
  onExportSelected: (snippets: Snippet[]) => void;
  onToggleFavorites: (ids: string[], isFavorite: boolean) => void;
  onAddTagsToSelected: (ids: string[], tags: string[]) => Promise<void>;
}

export function BulkOperations({
  selectedSnippets,
  allSnippets,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
  onExportSelected,
  onToggleFavorites,
  onAddTagsToSelected,
}: BulkOperationsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTags, setNewTags] = useState("");

  const selectedCount = selectedSnippets.size;
  const totalCount = allSnippets.length;
  const selectedSnippetObjects = allSnippets.filter(s => selectedSnippets.has(s.id));

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await onDeleteSelected([...selectedSnippets]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportSelected = () => {
    onExportSelected(selectedSnippetObjects);
  };

  const handleToggleFavorites = (isFavorite: boolean) => {
    onToggleFavorites([...selectedSnippets], isFavorite);
  };

  const handleAddTags = async () => {
    if (!newTags.trim()) return;
    
    const tags = newTags.split(",").map(t => t.trim()).filter(Boolean);
    await onAddTagsToSelected([...selectedSnippets], tags);
    setNewTags("");
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="gap-2"
        >
          <Square className="h-4 w-4" />
          Select All ({totalCount})
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Deselect All
        </Button>
        
        <Badge className="bg-primary text-primary-foreground">
          {selectedCount} selected
        </Badge>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Export */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportSelected}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              Actions
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleToggleFavorites(true)}>
              <Star className="h-4 w-4 mr-2" />
              Add to Favorites
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleToggleFavorites(false)}>
              <Star className="h-4 w-4 mr-2" />
              Remove from Favorites
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Selected
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedCount} snippet{selectedCount !== 1 ? "s" : ""}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The selected snippets will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Selection checkbox component for individual snippets
interface SelectionCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
}

export function SelectionCheckbox({ isSelected, onToggle }: SelectionCheckboxProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="h-6 w-6 p-0"
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-primary" />
      ) : (
        <Square className="h-4 w-4" />
      )}
    </Button>
  );
}