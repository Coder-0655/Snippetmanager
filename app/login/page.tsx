"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Check if Clerk is configured
const isClerkConfigured = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // In local mode, redirect to dashboard immediately
    if (!isClerkConfigured) {
      router.push('/dashboard');
    }
  }, [router]);

  // If Clerk is configured, dynamically import and render SignIn
  if (isClerkConfigured) {
    const { SignIn } = require('@clerk/nextjs');
    
    return (
      <div className="container flex items-center justify-center min-h-[calc(100dvh-3.5rem-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Snippet Manager</CardTitle>
            <CardDescription>
              Sign in to access your code snippets
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignIn />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Local mode - show message and redirect button
  return (
    <div className="container flex items-center justify-center min-h-[calc(100dvh-3.5rem-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to Snippet Manager</CardTitle>
          <CardDescription>
            Running in local storage mode
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            No authentication required. Your data is stored locally in your browser.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
