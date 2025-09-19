"use client";

import * as React from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

export type CodeLanguage = "ts" | "tsx" | "js" | "jsx" | "python" | "go" | "rust" | "bash" | "json";

export function CodeEditor({
  value,
  onChange,
  language = "ts",
  placeholder,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  language?: CodeLanguage;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div
      className={"rounded-md border border-border bg-muted font-mono text-sm " + (className ?? "")}
    >
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, Prism.languages[mapLang(language)], language)}
        padding={12}
        textareaId="code-editor"
        className="min-h-[200px] outline-none"
        textareaClassName="bg-transparent focus:outline-none"
        placeholder={placeholder}
        style={{ caretColor: "white" }}
      />
    </div>
  );
}

function mapLang(l: CodeLanguage): string {
  switch (l) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "python":
      return "python";
    case "go":
      return "go";
    case "rust":
      return "rust";
    case "bash":
      return "bash";
    case "json":
      return "json";
    default:
      return "javascript";
  }
}
