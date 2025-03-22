import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import speakeasy from "speakeasy";
import * as QRCode from "qrcode";

export async function GET(req: NextRequest) {
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
    
    // Generate a secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `EventHub:${user.email}`,
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    
    // Store the temporary secret in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret.base32, // Store temporarily until verified
        twoFactorEnabled: false,
      },
    });
    
    return NextResponse.json({
      qrCode: qrCodeUrl,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("Error in generate two-factor:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 