import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import speakeasy from "speakeasy";
import * as z from "zod";

const verifyTwoFactorSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
  secret: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const { code, secret } = verifyTwoFactorSchema.parse(body);
    
    // Use the provided secret or the one stored in the database
    const secretToVerify = secret || user.twoFactorSecret;
    
    if (!secretToVerify) {
      return NextResponse.json(
        { error: "Two-factor authentication not set up" },
        { status: 400 }
      );
    }
    
    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: secretToVerify,
      encoding: 'base32',
      token: code,
      window: 2, // Allow for some time drift
    });
    
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }
    
    // Enable 2FA for the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
      },
    });
    
    return NextResponse.json({
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    console.error("Error in verify two-factor:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 