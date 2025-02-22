import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Try to refresh the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If there's no session and the path isn't public, redirect to login
    if (!session && !isPublicPath(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, redirect to login for safety
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

function isPublicPath(pathname) {
  const publicPaths = [
    '/login',
    '/register',
    '/auth/callback',
    '/_next',
    '/api/auth'
  ];
  return publicPaths.some(path => pathname.startsWith(path));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 