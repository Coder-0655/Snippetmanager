"use client";

import { SignIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
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
