"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard, X } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const key = event.key.toLowerCase();
      const metaKey = event.metaKey || event.ctrlKey;
      const shiftKey = event.shiftKey;
      const altKey = event.altKey;

      const currentKeys = new Set<string>();
      if (metaKey) currentKeys.add("mod");
      if (shiftKey) currentKeys.add("shift");
      if (altKey) currentKeys.add("alt");
      currentKeys.add(key);

      setPressedKeys(currentKeys);

      // Check if any shortcut matches
      for (const shortcut of shortcuts) {
        const shortcutKeys = new Set(shortcut.keys.map(k => k.toLowerCase()));
        
        if (
          shortcutKeys.size === currentKeys.size &&
          [...shortcutKeys].every(k => currentKeys.has(k))
        ) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  const handleKeyUp = useCallback(() => {
    setPressedKeys(new Set());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);

  return { pressedKeys };
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key.toLowerCase()) {
        case "mod":
          return "⌘"; // Mac Command / Ctrl
        case "shift":
          return "⇧";
        case "alt":
          return "⌥";
        case "enter":
          return "↵";
        case "escape":
          return "Esc";
        case "backspace":
          return "⌫";
        case " ":
          return "Space";
        default:
          return key.toUpperCase();
      }
    });
  };

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.description.includes("snippet") ? "Snippets" :
                    shortcut.description.includes("search") ? "Search" :
                    shortcut.description.includes("navigation") ? "Navigation" : "General";
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {formatKeys(shortcut.keys).map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <Badge className="bg-muted text-muted-foreground font-mono text-xs px-2 py-1">
                            {key}
                          </Badge>
                          {keyIndex < formatKeys(shortcut.keys).length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/20 rounded">
          <strong>Note:</strong> ⌘ represents Cmd on Mac and Ctrl on Windows/Linux
        </div>
      </DialogContent>
    </Dialog>
  );
}