"use client";

import { useTheme } from "next-themes";
import { Editor, OnMount } from "@monaco-editor/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useRef, useEffect } from "react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  showLanguageSelector?: boolean;
  onLanguageChange?: (language: string) => void;
  className?: string;
}

const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "plaintext", label: "Plain Text" },
];

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "400px",
  readOnly = false,
  showLanguageSelector = true,
  onLanguageChange,
  className = "",
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<string>("vs-dark");
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (e) {
          // Ignore disposal errors
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Set theme based on current theme
    const currentTheme = theme === "dark" ? "vs-dark" : "vs-light";
    setEditorTheme(currentTheme);
    monaco.editor.setTheme(currentTheme);

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      lineNumbers: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
      },
    });

    // Add custom keybindings
    editor.addAction({
      id: "save-snippet",
      label: "Save Snippet",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        // Prevent default save behavior - handled by parent component
      },
    });
  }, [theme]);

  const handleLanguageChange = (newLanguage: string) => {
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    // Force remount editor with new language to avoid model disposal issues
    setEditorKey(prev => prev + 1);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showLanguageSelector && (
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <Badge variant="secondary">
            {supportedLanguages.find(l => l.value === language)?.label || language.toUpperCase()}
          </Badge>
        </div>
      )}
      
      <div className="relative">
        <Editor
          key={editorKey}
          height={height}
          defaultLanguage={language}
          language={language}
          value={value}
          onChange={(newValue) => onChange(newValue || "")}
          onMount={handleEditorDidMount}
          theme={editorTheme}
          options={{
            readOnly,
            contextmenu: !readOnly,
            selectOnLineNumbers: true,
            roundedSelection: false,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              useShadows: false,
            },
            renderWhitespace: "selection",
            renderControlCharacters: false,
            renderFinalNewline: "on",
            cursorBlinking: "blink",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            mouseWheelZoom: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        />
      </div>
      
      {!readOnly && (
        <div className="flex items-center justify-between p-3 border-t bg-muted/50 text-xs text-muted-foreground">
          <span>Press Ctrl/Cmd + S to save</span>
          <span>Monaco Editor</span>
        </div>
      )}
    </Card>
  );
}