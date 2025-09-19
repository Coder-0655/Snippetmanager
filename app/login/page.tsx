"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp, signInWithGitHub, signInDemo, isLocalMode } = useAuth();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password, name);
        if (isLocalMode) {
          router.push("/dashboard");
        } else {
          setError("Check your email for a verification link");
        }
      } else {
        await signIn(email, password);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
    setLoading(false);
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGitHub();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInDemo();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100dvh-3.5rem-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{isSignUp ? "Create Account" : "Sign In"}</CardTitle>
          <CardDescription>
            {isLocalMode ? (
              isSignUp
                ? "Create a local account (data stored in browser)"
                : "Sign in to your local account"
            ) : (
              isSignUp
                ? "Enter your details to create your account"
                : "Enter your credentials to access your snippets"
            )}
          </CardDescription>
          {isLocalMode && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              ⚡ Running in Local Mode - No server required
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLocalMode && (
            <Button
              onClick={handleDemoLogin}
              disabled={loading}
              variant="default"
              className="w-full"
            >
              🚀 Quick Demo Access
            </Button>
          )}

          {!isLocalMode && (
            <Button
              onClick={handleGitHubAuth}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Github className="h-4 w-4 mr-2" />
              Continue with GitHub
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isLocalMode ? "Or create account" : "Or continue with email"}
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
