import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Event creation schema
const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  startDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date/time"),
  endDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid end date/time"),
  bannerImage: z.string().optional(),
  isPaid: z.boolean(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  maxAttendees: z.number().int().positive("Max attendees must be positive").optional(),
  isPublished: z.boolean(),
  ticketCategories: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      price: z.number().min(0, "Price cannot be negative"),
      maxQuantity: z.number().int().positive("Max quantity must be positive").nullable(),
    })
  ).min(1, "At least one ticket category is required"),
});

// GET handler for fetching events
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated for certain queries
    const session = await getServerSession(authOptions);
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    let organizerId = searchParams.get("organizerId");
    const userId = searchParams.get("userId");
    const published = searchParams.get("published") === "true";
    
    // If userId=current is specified, use the logged-in user's ID
    if (userId === "current") {
      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      // For organizers fetching their own events
      if (session.user.role === "ORGANIZER") {
        organizerId = session.user.id;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (organizerId) {
      whereConditions.organizerId = organizerId;
    }
    
    if (published !== undefined) {
      whereConditions.isPublished = published;
    }
    
    // Get events from database
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: whereConditions,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          ticketCategories: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: {
          startDateTime: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({
        where: whereConditions,
      }),
    ]);
    
    // Prepare pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST handler to create a new event
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user is an organizer
    if (session.user.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can create events" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const validationResult = eventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid event data", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const eventData = validationResult.data;
    const { ticketCategories, ...eventDetails } = eventData;
    
    // Create event in database
    const event = await prisma.event.create({
      data: {
        ...eventDetails,
        startDateTime: new Date(eventDetails.startDateTime),
        endDateTime: new Date(eventDetails.endDateTime),
        organizerId: session.user.id,
        // Create ticket categories
        ticketCategories: {
          create: ticketCategories.map(category => ({
            name: category.name,
            description: category.description || "",
            price: category.price,
            maxQuantity: category.maxQuantity,
          })),
        },
      },
      include: {
        ticketCategories: true,
      },
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}