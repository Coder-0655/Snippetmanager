"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";

export default function SnippetPreview({
  title,
  code,
  language,
  tags = [],
}: {
  title: string;
  code: string;
  language: string;
  tags?: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{language.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          <CopyButton text={code} />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="bg-muted/50 p-4 font-mono text-sm overflow-auto max-h-48">
          <pre className="whitespace-pre-wrap">{code.trim()}</pre>
        </div>
      </div>
    </div>
  );
}
