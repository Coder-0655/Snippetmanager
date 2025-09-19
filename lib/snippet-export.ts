import type { Snippet } from "@/lib/supabase";

export interface ExportOptions {
  format: "json" | "markdown" | "txt";
  includeMetadata?: boolean;
  groupByLanguage?: boolean;
}

export class SnippetExporter {
  static export(snippets: Snippet[], options: ExportOptions = { format: "json" }): string {
    switch (options.format) {
      case "json":
        return this.exportAsJSON(snippets, options);
      case "markdown":
        return this.exportAsMarkdown(snippets, options);
      case "txt":
        return this.exportAsText(snippets, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  static downloadExport(
    snippets: Snippet[], 
    filename: string, 
    options: ExportOptions = { format: "json" }
  ): void {
    const content = this.export(snippets, options);
    const blob = new Blob([content], { type: this.getMimeType(options.format) });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static getMimeType(format: ExportOptions["format"]): string {
    switch (format) {
      case "json":
        return "application/json";
      case "markdown":
        return "text/markdown";
      case "txt":
        return "text/plain";
      default:
        return "text/plain";
    }
  }

  private static exportAsJSON(snippets: Snippet[], options: ExportOptions): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      count: snippets.length,
      snippets: options.includeMetadata 
        ? snippets 
        : snippets.map(({ id, created_at, updated_at, user_id, ...snippet }) => snippet),
    };

    return JSON.stringify(exportData, null, 2);
  }

  private static exportAsMarkdown(snippets: Snippet[], options: ExportOptions): string {
    let content = `# Code Snippets Export\n\n`;
    content += `Exported: ${new Date().toLocaleDateString()}\n`;
    content += `Total Snippets: ${snippets.length}\n\n`;

    if (options.groupByLanguage) {
      const groupedSnippets = this.groupByLanguage(snippets);
      
      for (const [language, languageSnippets] of Object.entries(groupedSnippets)) {
        content += `## ${language.toUpperCase()} (${languageSnippets.length} snippets)\n\n`;
        
        for (const snippet of languageSnippets) {
          content += this.formatSnippetAsMarkdown(snippet, options);
        }
      }
    } else {
      for (const snippet of snippets) {
        content += this.formatSnippetAsMarkdown(snippet, options);
      }
    }

    return content;
  }

  private static exportAsText(snippets: Snippet[], options: ExportOptions): string {
    let content = `Code Snippets Export\n`;
    content += `=====================\n\n`;
    content += `Exported: ${new Date().toLocaleDateString()}\n`;
    content += `Total Snippets: ${snippets.length}\n\n`;

    if (options.groupByLanguage) {
      const groupedSnippets = this.groupByLanguage(snippets);
      
      for (const [language, languageSnippets] of Object.entries(groupedSnippets)) {
        content += `${language.toUpperCase()} (${languageSnippets.length} snippets)\n`;
        content += "=".repeat(language.length + 20) + "\n\n";
        
        for (const snippet of languageSnippets) {
          content += this.formatSnippetAsText(snippet, options);
        }
      }
    } else {
      for (const snippet of snippets) {
        content += this.formatSnippetAsText(snippet, options);
      }
    }

    return content;
  }

  private static formatSnippetAsMarkdown(snippet: Snippet, options: ExportOptions): string {
    let content = `### ${snippet.title}\n\n`;
    
    if (options.includeMetadata) {
      content += `**Language:** ${snippet.language}\n`;
      if (snippet.tags.length > 0) {
        content += `**Tags:** ${snippet.tags.join(", ")}\n`;
      }
      content += `**Created:** ${new Date(snippet.created_at).toLocaleDateString()}\n\n`;
    }

    content += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`;
    content += "---\n\n";

    return content;
  }

  private static formatSnippetAsText(snippet: Snippet, options: ExportOptions): string {
    let content = `Title: ${snippet.title}\n`;
    
    if (options.includeMetadata) {
      content += `Language: ${snippet.language}\n`;
      if (snippet.tags.length > 0) {
        content += `Tags: ${snippet.tags.join(", ")}\n`;
      }
      content += `Created: ${new Date(snippet.created_at).toLocaleDateString()}\n`;
    }

    content += `\nCode:\n${"-".repeat(40)}\n${snippet.code}\n${"-".repeat(40)}\n\n`;

    return content;
  }

  private static groupByLanguage(snippets: Snippet[]): Record<string, Snippet[]> {
    return snippets.reduce((acc, snippet) => {
      const language = snippet.language;
      if (!acc[language]) {
        acc[language] = [];
      }
      acc[language].push(snippet);
      return acc;
    }, {} as Record<string, Snippet[]>);
  }
}

// Import functionality
export class SnippetImporter {
  static async importFromFile(file: File): Promise<Snippet[]> {
    const content = await file.text();
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "json":
        return this.importFromJSON(content);
      default:
        throw new Error(`Unsupported import format: ${extension}`);
    }
  }

  private static importFromJSON(content: string): Snippet[] {
    try {
      const data = JSON.parse(content);
      
      // Handle our export format
      if (data.snippets && Array.isArray(data.snippets)) {
        return this.validateSnippets(data.snippets);
      }
      
      // Handle direct array format
      if (Array.isArray(data)) {
        return this.validateSnippets(data);
      }
      
      throw new Error("Invalid JSON format");
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private static validateSnippets(data: any[]): Snippet[] {
    const requiredFields = ["title", "code", "language"];
    
    return data.map((item, index) => {
      for (const field of requiredFields) {
        if (!item[field]) {
          throw new Error(`Missing required field "${field}" in snippet ${index + 1}`);
        }
      }

      return {
        id: item.id || crypto.randomUUID(),
        title: item.title,
        code: item.code,
        language: item.language,
        tags: Array.isArray(item.tags) ? item.tags : [],
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        user_id: item.user_id || "imported",
      } as Snippet;
    });
  }
}