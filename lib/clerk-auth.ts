"use client";

import { useUser } from "@clerk/nextjs";
import { localStorageService } from "./local-storage";

// Simple service to get current user ID for snippets
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // For now, we'll use a simple approach:
  // - If using Clerk (has NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY), we'll handle this differently
  // - If local mode, use localStorage
  
  const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!hasClerkKey) {
    // Local mode
    const localUser = localStorageService.getCurrentUser();
    return localUser?.id || null;
  }
  
  // For Clerk mode, this will be handled in components with useUser hook
  return null;
};

// Hook to get user info in Clerk mode
export const useCurrentUser = () => {
  const { user, isLoaded } = useUser();
  
  const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!hasClerkKey) {
    // Local mode
    const localUser = localStorageService.getCurrentUser();
    return {
      userId: localUser?.id || null,
      user: localUser,
      isLoaded: true,
      isLocalMode: true
    };
  }
  
  return {
    userId: user?.id || null,
    user: user,
    isLoaded,
    isLocalMode: false
  };
};