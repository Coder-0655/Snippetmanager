import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snippet Manager",
  description: "Save, search, and share your code snippets in seconds.",
  metadataBase: new URL("https://snippet-manager.local"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <div className="min-h-dvh flex flex-col">
              <header className="border-b border-border">
                <div className="container flex h-14 items-center justify-between">
                  <Link href="/" className="font-semibold tracking-tight">
                    Snippet Manager
                  </Link>
                  <nav className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Link className="hover:text-foreground" href="/dashboard">
                      Dashboard
                    </Link>
                    <Link className="hover:text-foreground" href="/login">
                      Login
                    </Link>
                    <a
                      className="hover:text-foreground"
                      href="https://github.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  </nav>
                </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="border-t border-border">
                <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
                  <span>MIT License</span>
                  <div className="flex items-center gap-4">
                    <a href="https://github.com/" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                    <a href="https://twitter.com/" target="_blank" rel="noreferrer">
                      Twitter
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
