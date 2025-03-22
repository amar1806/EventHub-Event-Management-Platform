import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

// GET handler to fetch user's tickets
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const eventId = searchParams.get('eventId');
    
    // Build where clause
    const where: any = {
      userId: session.user.id,
    };
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    // Get all tickets for the user
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            location: true,
            bannerImage: true,
            isPublished: true,
          },
        },
        category: true,
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // If status filter is provided, filter tickets by order status
    let filteredTickets = tickets;
    if (status) {
      filteredTickets = tickets.filter((ticket: any) => ticket.order.status === status);
    }
    
    return NextResponse.json(filteredTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching tickets' },
      { status: 500 }
    );
  }
}

// POST handler to book tickets
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { eventId, categoryId, quantity = 1 } = body;
    
    // Validate required fields
    if (!eventId || !categoryId || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Get event and ticket category
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketCategories: {
          where: { id: categoryId },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (!event.isPublished) {
      return NextResponse.json(
        { error: 'Event is not published' },
        { status: 400 }
      );
    }
    
    if (event.ticketCategories.length === 0) {
      return NextResponse.json(
        { error: 'Ticket category not found' },
        { status: 404 }
      );
    }
    
    const category = event.ticketCategories[0];
    
    // Check if tickets are available
    const soldTicketsCount = await prisma.ticket.count({
      where: { 
        eventId,
        categoryId, 
      },
    });
    
    // Check if max quantity for category is reached
    if (category.maxQuantity !== null && 
        soldTicketsCount + quantity > category.maxQuantity) {
      return NextResponse.json(
        { 
          error: 'Not enough tickets available in this category',
          available: category.maxQuantity - soldTicketsCount 
        },
        { status: 400 }
      );
    }
    
    // Check if max attendees for event is reached
    if (event.maxAttendees !== null) {
      const totalSoldTickets = await prisma.ticket.count({
        where: { eventId },
      });
      
      if (totalSoldTickets + quantity > event.maxAttendees) {
        return NextResponse.json(
          { 
            error: 'Event has reached maximum capacity',
            available: event.maxAttendees - totalSoldTickets 
          },
          { status: 400 }
        );
      }
    }
    
    // Calculate total amount
    const totalAmount = category.price * quantity;
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: totalAmount > 0 ? 'PENDING' : 'CONFIRMED',
      },
    });
    
    // Create tickets
    const ticketData = Array(quantity).fill(null).map(() => ({
      qrCode: randomUUID(),
      isCheckedIn: false,
      userId: session.user.id,
      eventId,
      categoryId,
      orderId: order.id,
    }));
    
    const tickets = await prisma.ticket.createMany({
      data: ticketData,
    });
    
    // If the ticket is free, no payment needed
    if (totalAmount === 0) {
      return NextResponse.json({
        message: 'Tickets booked successfully',
        order,
        ticketCount: quantity,
      }, { status: 201 });
    } else {
      // For paid tickets, return order info for payment
      return NextResponse.json({
        message: 'Order created, awaiting payment',
        order,
        ticketCount: quantity,
        paymentRequired: true,
        amount: totalAmount,
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error booking tickets:', error);
    return NextResponse.json(
      { error: 'An error occurred while booking tickets' },
      { status: 500 }
    );
  }
} 