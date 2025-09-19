"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { SearchProvider, useSearch } from "@/lib/search-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { searchQuery, setSearchQuery } = useSearch();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-3.5rem-4rem)]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect
  }

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem-4rem)] lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block border-r border-border">
        <div className="p-4">
          <div className="text-sm font-semibold mb-4">Navigation</div>
          <nav className="grid gap-2 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link
              href="/dashboard/snippets"
              className="text-muted-foreground hover:text-foreground"
            >
              My Snippets
            </Link>
            <Link href="/dashboard/tags" className="text-muted-foreground hover:text-foreground">
              Tags
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          </nav>
        </div>
      </aside>
      <div className="flex flex-col">
        <div className="border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search snippets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-b border-border">
          <div className="flex items-center gap-2 p-4 overflow-x-auto">
            <Link
              href="/dashboard"
              className="whitespace-nowrap px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/dashboard/snippets"
              className="whitespace-nowrap px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Snippets
            </Link>
            <Link
              href="/dashboard/tags"
              className="whitespace-nowrap px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Tags
            </Link>
            <Link
              href="/dashboard/settings"
              className="whitespace-nowrap px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <DashboardContent>{children}</DashboardContent>
    </SearchProvider>
  );
}
