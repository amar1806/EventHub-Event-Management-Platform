import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

// Function to generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate the reset password email HTML template
function generateResetEmailHTML(resetLink: string, username: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Password Reset Link</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password for your account.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #4a7aff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser: ${resetLink}</p>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `;
}

// Generate the OTP email HTML template
function generateOTPEmailHTML(otp: string, username: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Your Password Reset Code</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password for your account.</p>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <p>Enter this 6-digit code on the verification page:</p>
        <div style="text-align: center; margin: 20px 0;">
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</div>
        </div>
        <p style="font-size: 12px; color: #666;">This code will expire in 1 hour.</p>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Team</p>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const { email, method } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!method || (method !== 'link' && method !== 'otp')) {
      return NextResponse.json(
        { success: false, error: 'Valid reset method is required (link or otp)' },
        { status: 400 }
      );
    }

    // Check if email exists in our database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if the user exists or not
    // Just return a generic success message
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If your email is in our system, you will receive instructions shortly',
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const otp = generateOTP();

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    // Update user with reset token/OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: method === 'link' ? resetToken : null,
        resetTokenExpiry: method === 'link' ? expiryDate : null,
        otp: method === 'otp' ? otp : null,
        otpExpiry: method === 'otp' ? expiryDate : null,
      },
    });

    // Create email content based on method
    let emailHtml;
    let subject;
    let resetUrl;

    if (method === 'link') {
      resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      subject = 'Reset Your Password';
      emailHtml = generateResetEmailHTML(resetUrl, user.name || email);
    } else { // method === 'otp'
      subject = 'Your Password Reset Code';
      emailHtml = generateOTPEmailHTML(otp, user.name || email);
    }

    // Send email with Nodemailer
    let emailSent = false;
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: email,
        subject: subject,
        html: emailHtml,
      });

      console.log('Email sent:', info.messageId);
      emailSent = true;

      // For development log more details
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email details:', {
          messageId: info.messageId,
          envelope: info.envelope,
          accepted: info.accepted,
          rejected: info.rejected
        });
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    // Return success response with additional info for development
    let responseData: any = { 
      success: true,
      message: 'Password reset instructions sent successfully'
    };
    
    // In development mode, provide debugging info to server console ONLY
    if (process.env.NODE_ENV === 'development') {
      // Log the full details to the server console (only in dev)
      console.log('Password reset requested for:', email);
      
      if (method === 'link') {
        console.log('Reset token:', resetToken);
        console.log('Reset link:', resetUrl);
      } else {
        console.log('OTP code:', otp);
      }
      
      // Don't send any security tokens/OTP to frontend - only notify that they exist in logs
      responseData.dev = { 
        securityInfoInLogs: true 
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 