import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json();

    // Enhanced validation
    if (!email || !otp || !password) {
      console.warn('Password reset attempt with missing fields:', { email: !!email, otp: !!otp, password: !!password });
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and password are required' },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the user with this email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Enhanced security: log attempts but don't reveal user existence
    if (!user) {
      console.warn(`Password reset attempted for non-existent user: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      console.warn(`Password reset attempted without OTP being set: ${email}`);
      return NextResponse.json(
        { success: false, error: 'No OTP has been requested. Please request a password reset first.' },
        { status: 400 }
      );
    }

    // Check OTP expiry separately to provide better error messages
    if (new Date() > user.otpExpiry) {
      console.warn(`Password reset attempted with expired OTP: ${email}`);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP with strict comparison
    if (user.otp !== otp) {
      console.warn(`Password reset attempted with invalid OTP: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear the OTP and reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`Password reset successfully for user: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 