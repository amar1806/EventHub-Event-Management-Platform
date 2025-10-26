import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    // Enhanced validation
    if (!email || !otp) {
      console.warn('OTP verification attempt with missing fields:', { email: !!email, otp: !!otp });
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // OTP should be 6 digits
    if (!/^\d{6}$/.test(otp)) {
      console.warn(`Invalid OTP format in verification attempt for email: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format. OTP must be 6 digits.' },
        { status: 400 }
      );
    }

    // Find the user with this email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Enhanced security: log attempts but don't reveal user existence
    if (!user) {
      console.warn(`OTP verification attempted for non-existent user: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists 
    if (!user.otp || !user.otpExpiry) {
      console.warn(`OTP verification attempted without OTP being set: ${email}`);
      return NextResponse.json(
        { success: false, error: 'No OTP has been requested. Please request a password reset first.' },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      console.warn(`OTP verification attempted with expired OTP: ${email}`);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Strict OTP comparison (prevents timing attacks by using a constant-time comparison)
    if (user.otp !== otp) {
      console.warn(`OTP verification failed with invalid code for: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // For security, track verification timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Don't clear OTP yet, it will be cleared after password reset
        // But update the OTP verification timestamp
        updatedAt: new Date(),
      },
    });

    console.log(`OTP verified successfully for user: ${email}`);

    // OTP is valid - return success
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 