import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/events/wishlist - Add/remove event from wishlist
export async function POST(req: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to manage your wishlist" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { eventId } = await req.json();
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event is already in wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    let result;
    let action;

    if (existingWishlist) {
      // Remove from wishlist
      result = await prisma.wishlist.delete({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });
      action = "removed";
    } else {
      // Add to wishlist
      result = await prisma.wishlist.create({
        data: {
          userId,
          eventId,
        },
      });
      action = "added";
    }

    return NextResponse.json({
      success: true,
      action,
      wishlist: result,
    });
  } catch (error) {
    console.error("Wishlist operation error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}

// GET /api/events/wishlist - Get user's wishlist
export async function GET(req: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view your wishlist" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's wishlist with event details
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            bannerImage: true,
            startDateTime: true,
            endDateTime: true,
            location: true,
            price: true,
            organizer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
} 