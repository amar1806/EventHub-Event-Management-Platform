import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;
  
  // Handle sign-out redirect specifically
  if (pathname.includes('/api/auth/signout') || pathname === '/auth/signout') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/', 
    '/events', 
    '/about', 
    '/contact', 
    '/auth/login', 
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/verify-otp',
    '/auth/reset-password'
  ];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }
  
  // Static assets don't require authentication
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/webhook') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Check for authentication
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Role-specific route protection
  const userRole = token.role as string;
  
  // Protected routes by role
  
  // Admin routes protection
  if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Organizer routes protection
  if (pathname.startsWith('/dashboard/organizer') && userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Attendee routes protection
  if (pathname.startsWith('/dashboard/attendee') && userRole !== 'ATTENDEE' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Event creation and management routes (only accessible to ORGANIZER and ADMIN)
  if ((pathname.startsWith('/events/create') || pathname.includes('/edit')) && 
      userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/events', request.url));
  }
  
  // Allow user to access their appropriate dashboard
  return NextResponse.next();
}

// Specify the paths that this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/organizer/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 