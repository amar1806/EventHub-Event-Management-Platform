import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
  const { id } = await params;
    
    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: id,
      },
      include: {
        event: true,
        order: true
      }
    });
    
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to cancel this ticket
    if (session.user.role !== "ADMIN" && ticket.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to cancel this ticket" },
        { status: 403 }
      );
    }
    
    // Check if ticket is already cancelled
    if (ticket.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Ticket is already cancelled" },
        { status: 400 }
      );
    }
    
    // Check if ticket is already checked in
    if (ticket.isCheckedIn) {
      return NextResponse.json(
        { error: "Cannot cancel a ticket that has been checked in" },
        { status: 400 }
      );
    }
    
    // Check the 48-hour policy
    const now = new Date();
    const eventStartTime = new Date(ticket.event.startDateTime);
    const timeDiff = eventStartTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 48) {
      return NextResponse.json(
        { error: "Tickets can only be cancelled 48 hours or more before the event starts" },
        { status: 400 }
      );
    }
    
    // Cancel the ticket
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: id,
      },
      data: {
        status: "CANCELLED",
      },
    });
    
    // If the ticket belongs to an order, check if remaining tickets exist
    const orderId = ticket.orderId;
    if (orderId) {
      const remainingTickets = await prisma.ticket.findMany({
        where: {
          orderId: orderId,
          status: { not: "CANCELLED" }
        }
      });

      // If all tickets in the order are cancelled, update the order status
      if (remainingTickets.length === 0) {
        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: "CANCELLED",
          },
        });
      }
    }
    
    return NextResponse.json({
      message: "Ticket cancelled successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json(
      { error: "Failed to cancel ticket" },
      { status: 500 }
    );
  }
} 