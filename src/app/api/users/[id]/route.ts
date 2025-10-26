import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET user data by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // Correct way to access params in Next.js — normalize promise/plain
  const { id: userId } = await params;
    console.log(userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find user with their events if they're an organizer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        birthday: true,
        address: true,
        gender: true,
        phoneNumber: true,
        website: true,
        createdAt: true,
        events: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
            description: true,
            bannerImage: true,
            startDateTime: true,
            endDateTime: true,
            location: true,
            price: true,
          },
          orderBy: {
            startDateTime: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}