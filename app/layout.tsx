import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { UserSyncProvider } from "@/components/user-sync-provider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snippet Manager",
  description: "Save, search, and share your code snippets in seconds.",
  metadataBase: new URL("https://snippet-manager.local"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <UserSyncProvider>
              <div className="min-h-dvh flex flex-col">
                <header className="border-b border-border">
                  <div className="container flex h-14 items-center justify-between">
                    <Link href="/" className="font-semibold tracking-tight">
                      Snippet Manager
                    </Link>
                    <nav className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SignedIn>
                        <Link className="hover:text-foreground" href="/dashboard">
                          Dashboard
                        </Link>
                        <UserButton />
                      </SignedIn>
                      <SignedOut>
                        <SignInButton>
                          <button className="hover:text-foreground">Sign In</button>
                        </SignInButton>
                        <SignUpButton>
                          <button className="bg-primary text-primary-foreground rounded-lg font-medium text-sm h-9 px-4 hover:bg-primary/90">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </SignedOut>
                    </nav>
                  </div>
                </header>
                <main className="flex-1">{children}</main>
                <footer className="border-t border-border">
                  <div className="container flex h-16 items-center justify-center text-sm text-muted-foreground">
                    <span>© 2025 Snippet Manager. All rights reserved.</span>
                  </div>
                </footer>
              </div>
            </UserSyncProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
