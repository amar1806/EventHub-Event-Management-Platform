import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
  const { id: ticketId } = await params;
    
    // Get the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: {
          include: {
            event: {
              select: {
                organizerId: true
              }
            }
          }
        },
        event: true
      }
    });
    
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update the ticket
    // Use direct event relationship or via category
    const organizerId = ticket.category?.event.organizerId || ticket.event.organizerId;
    const isOrganizer = organizerId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update this ticket" },
        { status: 403 }
      );
    }
    
    // Parse the request body to get new check-in status
    const body = await req.json();
    const { status } = body;
    
    if (status !== "CHECKED_IN" && status !== "NOT_CHECKED_IN") {
      return NextResponse.json(
        { error: "Invalid check-in status" },
        { status: 400 }
      );
    }
    
    // Update the ticket status
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isCheckedIn: status === "CHECKED_IN",
        // Use status field for tracking checked-in state
        status: status === "CHECKED_IN" ? "CHECKED_IN" : ticket.status
      }
    });
    
    return NextResponse.json({
      message: "Ticket status updated successfully",
      ticket: {
        id: updatedTicket.id,
        isCheckedIn: updatedTicket.isCheckedIn,
        status: updatedTicket.status
      }
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json(
      { error: "Failed to update ticket status" },
      { status: 500 }
    );
  }
} 