import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const eventId = params.id;
    
    // First check if the user has permission to view this event's attendees
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view attendees
    const isOrganizer = event.organizerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to view attendees for this event" },
        { status: 403 }
      );
    }
    
    // Fetch tickets and related user information
    const tickets = await prisma.ticket.findMany({
      where: {
        ticketCategory: {
          eventId: eventId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        ticketCategory: {
          select: {
            name: true
          }
        },
        order: {
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });
    
    // Format the data for the frontend
    const attendees = tickets.map(ticket => ({
      id: ticket.id,
      name: ticket.user.name,
      email: ticket.user.email,
      phone: ticket.user.phone,
      ticketCount: ticket.quantity,
      ticketCategory: ticket.ticketCategory.name,
      purchaseDate: ticket.order.createdAt,
      checkInStatus: ticket.checkInStatus
    }));
    
    return NextResponse.json({ attendees });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
} 