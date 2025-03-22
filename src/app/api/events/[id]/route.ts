import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { z } from 'zod';

// Ticket category schema
const ticketCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  maxQuantity: z.number().int().positive("Max quantity must be positive").nullable(),
});

// Event update schema
const eventUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  location: z.string().min(5, "Location must be at least 5 characters").optional(),
  startDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date/time").optional(),
  endDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid end date/time").optional(),
  bannerImage: z.string().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  maxAttendees: z.number().int().positive("Max attendees must be positive").optional().nullable(),
  isPublished: z.boolean().optional(),
  ticketCategories: z.array(ticketCategorySchema).optional(),
});

// GET handler for fetching a single event by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    // Fetch event with relationships
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
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
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH handler for updating an event
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch the event to check permissions
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        organizerId: true,
        ticketCategories: {
          select: {
            id: true
          }
        }
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this event
    const isOrganizer = event.organizerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update this event" },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = eventUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid event data", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { ticketCategories, ...validatedData } = validationResult.data;
    
    // Prepare update data with the correct types
    const updateData: any = { ...validatedData };
    
    // Convert date strings to Date objects if provided
    if (updateData.startDateTime) {
      updateData.startDateTime = new Date(updateData.startDateTime);
    }
    
    if (updateData.endDateTime) {
      updateData.endDateTime = new Date(updateData.endDateTime);
    }
    
    // Handle ticket categories update if provided
    if (ticketCategories && ticketCategories.length > 0) {
      // Get existing ticket category IDs
      const existingCategoryIds = event.ticketCategories.map(cat => cat.id);
      
      // Separate categories to create, update, or delete
      const categoriesToUpdate = ticketCategories.filter(cat => cat.id && existingCategoryIds.includes(cat.id));
      const categoriesToCreate = ticketCategories.filter(cat => !cat.id);
      const categoryIdsToKeep = categoriesToUpdate.map(cat => cat.id as string);
      const categoryIdsToDelete = existingCategoryIds.filter(id => !categoryIdsToKeep.includes(id));
      
      // Delete removed categories
      if (categoryIdsToDelete.length > 0) {
        await prisma.ticketCategory.deleteMany({
          where: {
            id: {
              in: categoryIdsToDelete
            }
          }
        });
      }
      
      // Update existing categories
      for (const category of categoriesToUpdate) {
        const { id, ...categoryData } = category;
        await prisma.ticketCategory.update({
          where: { id },
          data: categoryData
        });
      }
      
      // Create new categories
      if (categoriesToCreate.length > 0) {
        await prisma.ticketCategory.createMany({
          data: categoriesToCreate.map(cat => ({
            ...cat,
            eventId
          }))
        });
      }
    }
    
    // Update the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: updateData,
      include: {
        ticketCategories: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch the event to check permissions
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        organizerId: true,
        tickets: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this event
    const isOrganizer = event.organizerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to delete this event" },
        { status: 403 }
      );
    }
    
    // Check if the event has tickets
    if (event.tickets.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete an event with tickets already sold" },
        { status: 400 }
      );
    }
    
    // Delete ticket categories first (cascading delete)
    await prisma.ticketCategory.deleteMany({
      where: {
        eventId,
      },
    });
    
    // Delete the event
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    
    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}