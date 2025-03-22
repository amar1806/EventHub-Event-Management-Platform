import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Google OAuth sign-in URL endpoint
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // If user is already logged in, redirect to dashboard
    if (session) {
      if (session.user.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else if (session.user.role === 'ORGANIZER') {
        return NextResponse.redirect(new URL('/dashboard/organizer', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard/attendee', request.url));
      }
    }
    
    // For Google authentication, NextAuth.js handles the OAuth flow through its built-in routes
    // We'll redirect to NextAuth's sign-in page with Google provider specified
    return NextResponse.redirect(new URL('/api/auth/signin?callbackUrl=/&provider=google', request.url));
    
  } catch (error) {
    console.error('Error processing Google auth:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
} 