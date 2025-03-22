import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get order with related data
    const order = await prisma.order.findUnique({
      where: {
        id: params.id,
      },
      include: {
        tickets: {
          include: {
            category: true,
            event: true,
          },
        },
      },
    });
    
    // Check if order exists
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this order
    if (order.userId !== session.user.id) {
      // If admin, allow access
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      
      // Get the event info from first ticket to check organizer
      const firstTicket = order.tickets[0];
      const isOrganizer = firstTicket && 
                           firstTicket.event && 
                           firstTicket.event.organizerId === session.user.id;
                           
      if (user?.role !== "ADMIN" && !isOrganizer) {
        return NextResponse.json(
          { error: "You do not have permission to view this order" },
          { status: 403 }
        );
      }
    }
    
    // Transform the response to match the expected format for the client
    const eventInfo = order.tickets.length > 0 ? order.tickets[0].event : null;
    
    const transformedOrder = {
      ...order,
      tickets: order.tickets.map(ticket => ({
        ...ticket,
        ticketCategory: ticket.category // Rename category to ticketCategory for client compatibility
      })),
      event: eventInfo
    };
    
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the order" },
      { status: 500 }
    );
  }
} 