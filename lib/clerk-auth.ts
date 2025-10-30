"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { createSupabaseClient } from "./supabase";
import { localStorageService } from "./local-storage";
import { initializeDefaultTags } from "./snippets";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      setupUserInSupabase();
    } else {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const setupUserInSupabase = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const supabase = createSupabaseClient();
      
      // Check if user already exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking user existence:', fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        // Create new user in Supabase
        const userData = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || user.firstName || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([userData]);

        if (insertError) {
          console.error('Error creating user:', insertError);
          throw insertError;
        }

        // Initialize default tags for new user
        await initializeDefaultTags(user.id);

        console.log('User created in Supabase:', userData);
      } else {
        // Update existing user data if needed
        const updatedData = {
          email: user.emailAddresses[0]?.emailAddress || existingUser.email,
          name: user.fullName || user.firstName || existingUser.name,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('users')
          .update(updatedData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          throw updateError;
        }
      }

      setIsSetupComplete(true);
      
      // Navigate to dashboard after successful setup
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/') {
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('Failed to setup user in Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isSignedIn,
    isLoaded,
    isSetupComplete,
    isLoading: isLoading && isSignedIn,
  };
}

// Simple service to get current user ID for snippets
export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
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