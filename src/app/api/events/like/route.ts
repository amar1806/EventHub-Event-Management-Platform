import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// POST /api/events/like - Add/remove event like
export async function POST(req: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to like events" },
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

    // Check if event is already liked by the user
    const existingLike = await prisma.eventLike.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    let result;
    let action;

    if (existingLike) {
      // Remove like
      result = await prisma.eventLike.delete({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });
      action = "unliked";
    } else {
      // Add like
      result = await prisma.eventLike.create({
        data: {
          userId,
          eventId,
        },
      });
      action = "liked";
    }

    // Get updated like count
    const likeCount = await prisma.eventLike.count({
      where: { eventId },
    });

    return NextResponse.json({
      success: true,
      action,
      likeCount,
    });
  } catch (error) {
    console.error("Like operation error:", error);
    return NextResponse.json(
      { error: "Failed to process like" },
      { status: 500 }
    );
  }
}

// GET /api/events/like?eventId=xxx - Get like status and count for an event
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get like count
    const likeCount = await prisma.eventLike.count({
      where: { eventId },
    });

    // Check if user liked the event
    let isLiked = false;
    if (userId) {
      const userLike = await prisma.eventLike.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      success: true,
      likeCount,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching like information:", error);
    return NextResponse.json(
      { error: "Failed to fetch like information" },
      { status: 500 }
    );
  }
} 