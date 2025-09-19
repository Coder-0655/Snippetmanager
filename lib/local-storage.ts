"use client";

export interface LocalSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  description?: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface LocalUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

class LocalStorageService {
  private getStorageKey(key: string): string {
    return `snippet-manager-${key}`;
  }

  // User management
  setCurrentUser(user: LocalUser): void {
    localStorage.setItem(this.getStorageKey('current-user'), JSON.stringify(user));
  }

  getCurrentUser(): LocalUser | null {
    const userStr = localStorage.getItem(this.getStorageKey('current-user'));
    return userStr ? JSON.parse(userStr) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.getStorageKey('current-user'));
  }

  // Snippets management
  getSnippets(): LocalSnippet[] {
    const snippetsStr = localStorage.getItem(this.getStorageKey('snippets'));
    return snippetsStr ? JSON.parse(snippetsStr) : [];
  }

  setSnippets(snippets: LocalSnippet[]): void {
    localStorage.setItem(this.getStorageKey('snippets'), JSON.stringify(snippets));
  }

  addSnippet(snippet: Omit<LocalSnippet, 'id' | 'created_at' | 'updated_at'>): LocalSnippet {
    const newSnippet: LocalSnippet = {
      ...snippet,
      id: crypto.randomUUID(),
      project_id: snippet.project_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const snippets = this.getSnippets();
    snippets.push(newSnippet);
    this.setSnippets(snippets);
    
    return newSnippet;
  }

  updateSnippet(id: string, updates: Partial<Omit<LocalSnippet, 'id' | 'created_at' | 'user_id'>>): LocalSnippet | null {
    const snippets = this.getSnippets();
    const snippetIndex = snippets.findIndex(s => s.id === id);
    
    if (snippetIndex === -1) return null;

    const updatedSnippet = {
      ...snippets[snippetIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    snippets[snippetIndex] = updatedSnippet;
    this.setSnippets(snippets);
    
    return updatedSnippet;
  }

  deleteSnippet(id: string): boolean {
    const snippets = this.getSnippets();
    const filteredSnippets = snippets.filter(s => s.id !== id);
    
    if (filteredSnippets.length === snippets.length) return false;
    
    this.setSnippets(filteredSnippets);
    return true;
  }

  searchSnippets(query: string): LocalSnippet[] {
    if (!query.trim()) return this.getSnippets();
    
    const snippets = this.getSnippets();
    const searchQuery = query.toLowerCase();
    
    return snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(searchQuery) ||
      snippet.code.toLowerCase().includes(searchQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
      (snippet.description && snippet.description.toLowerCase().includes(searchQuery))
    );
  }

  // Tags management
  getAllTags(): string[] {
    const snippets = this.getSnippets();
    const allTags = snippets.flatMap(snippet => snippet.tags);
    return [...new Set(allTags)].sort();
  }

  getSnippetsByTag(tag: string): LocalSnippet[] {
    const snippets = this.getSnippets();
    return snippets.filter(snippet => snippet.tags.includes(tag));
  }

  // Utility methods
  clearAllData(): void {
    const keys = ['current-user', 'snippets'];
    keys.forEach(key => {
      localStorage.removeItem(this.getStorageKey(key));
    });
  }

  exportData(): { user: LocalUser | null; snippets: LocalSnippet[] } {
    return {
      user: this.getCurrentUser(),
      snippets: this.getSnippets(),
    };
  }

  importData(data: { user?: LocalUser; snippets?: LocalSnippet[] }): void {
    if (data.user) {
      this.setCurrentUser(data.user);
    }
    if (data.snippets) {
      this.setSnippets(data.snippets);
    }
  }
}

export const localStorageService = new LocalStorageService();