"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModernButton } from "@/components/ui/modern-button";
import { useUser } from "@/lib/use-auth";

export function HomePageContent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only show homepage content if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/login">
          <ModernButton 
            animate
            className="w-full sm:w-auto px-6 text-sm font-medium shadow hover:opacity-90"
          >
            Get Started
          </ModernButton>
        </Link>
        <Link href="/dashboard">
          <ModernButton 
            animate
            variant="secondary"
            className="w-full sm:w-auto px-6 text-sm font-medium"
          >
            View Dashboard
          </ModernButton>
        </Link>
      </div>
    );
  }

  return null;
}