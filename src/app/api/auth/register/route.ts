import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcrypt';
import prisma from '@/lib/db';

// Define validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'ORGANIZER', 'ATTENDEE']).default('ATTENDEE'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Processing registration request');
    const body = await request.json();
    
    console.log('Registration data received:', { 
      ...body, 
      password: body.password ? '[HIDDEN]' : undefined 
    });
    
    // Validate the request body
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      console.log('Validation failed:', validation.error.errors);
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password, role } = validation.data;
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      console.log('User with email already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    
    console.log('User created successfully:', { id: user.id, email: user.email, role: user.role });
    
    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { user: userWithoutPassword, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // More specific error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Check for Prisma-specific errors
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
    const isPrismaError = errorMessage.includes('Prisma');
    
    return NextResponse.json(
      { 
        error: 'An error occurred during registration',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        type: isPrismaError ? 'database' : 'server'
      },
      { status: 500 }
    );
  }
} 