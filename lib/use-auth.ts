"use client";

import { useUser as useClerkUser } from "@clerk/nextjs";

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  typeof window !== 'undefined'
);

/**
 * Custom hook that provides user authentication
 * Falls back to local mode when Clerk is not configured
 */
export function useUser() {
  // If Clerk is configured, use it
  if (isClerkConfigured) {
    return useClerkUser();
  }

  // Otherwise, return a mock user for local mode
  return {
    user: {
      id: "local-user",
      emailAddresses: [{ emailAddress: "local@user.com" }],
    },
    isLoaded: true,
    isSignedIn: true,
  };
}

/**
 * Get the user ID, works in both Clerk and local mode
 */
export function getUserId(user: any): string {
  if (!user) return "local-user";
  return user.id || "local-user";
}
