"use client";

import { localStorageService, type LocalUser } from './local-storage';

export interface LocalAuthCredentials {
  email: string;
  password: string;
  name?: string;
}

class LocalAuthService {
  private getStorageKey(key: string): string {
    return `snippet-manager-auth-${key}`;
  }

  // User registration
  async signUp({ email, password, name }: LocalAuthCredentials): Promise<LocalUser> {
    // Check if user already exists
    const existingUsers = this.getAllUsers();
    if (existingUsers.find(user => user.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: LocalUser = {
      id: crypto.randomUUID(),
      email,
      name,
      created_at: new Date().toISOString(),
    };

    // Store user credentials (in a real app, password would be hashed)
    const userCredentials = {
      ...newUser,
      password, // Note: In production, this should be hashed
    };

    // Save to users list
    const users = existingUsers;
    users.push(userCredentials);
    localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));

    // Set as current user
    localStorageService.setCurrentUser(newUser);

    return newUser;
  }

  // User login
  async signIn({ email, password }: LocalAuthCredentials): Promise<LocalUser> {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create user object without password
    const userWithoutPassword: LocalUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
    };

    // Set as current user
    localStorageService.setCurrentUser(userWithoutPassword);

    return userWithoutPassword;
  }

  // User logout
  async signOut(): Promise<void> {
    localStorageService.clearCurrentUser();
  }

  // Get current user
  getCurrentUser(): LocalUser | null {
    return localStorageService.getCurrentUser();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Demo login (no password required)
  async signInDemo(): Promise<LocalUser> {
    const demoUser: LocalUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      created_at: new Date().toISOString(),
    };

    localStorageService.setCurrentUser(demoUser);
    return demoUser;
  }

  // Private helper methods
  private getAllUsers(): any[] {
    const usersStr = localStorage.getItem(this.getStorageKey('users'));
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Clear all auth data
  clearAllAuthData(): void {
    localStorage.removeItem(this.getStorageKey('users'));
    localStorageService.clearCurrentUser();
  }

  // Get user statistics
  getUserStats(): { totalUsers: number; currentUser: LocalUser | null } {
    return {
      totalUsers: this.getAllUsers().length,
      currentUser: this.getCurrentUser(),
    };
  }
}

export const localAuthService = new LocalAuthService();