"use client";

import { useUserSync } from "@/lib/clerk-auth";

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUserSync();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}