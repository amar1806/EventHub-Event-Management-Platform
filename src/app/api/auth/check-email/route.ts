import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if this email exists in our database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Only fetch the ID, we don't need other details
    });

    // For security reasons, always return success even if the email doesn't exist
    // This prevents user enumeration attacks
    
    return NextResponse.json({
      success: true,
      // Don't reveal whether user exists or not in the response
    });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 