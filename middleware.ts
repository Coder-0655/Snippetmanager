import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY
);

export async function middleware(req: NextRequest) {
  // If Clerk is not configured, allow all routes (local mode)
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  // If Clerk is configured, use Clerk middleware
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  
  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
  
  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    return NextResponse.next();
  })(req as any, {} as any);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};