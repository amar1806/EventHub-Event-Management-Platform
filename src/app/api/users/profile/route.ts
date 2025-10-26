import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// PUT /api/users/profile - Update user profile
export async function PUT(req: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Format birthday if provided
    let birthday = data.birthday ? new Date(data.birthday) : null;
    
    // Check if birthday is a valid date
    if (birthday && isNaN(birthday.getTime())) {
      return NextResponse.json(
        { error: "Invalid birthday date format" },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image,
        bio: data.bio,
        birthday: birthday,
        address: data.address,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        website: data.website,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        birthday: true,
        address: true,
        gender: true,
        phoneNumber: true,
        website: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 