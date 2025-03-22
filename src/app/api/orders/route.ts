import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Validation schema for order creation
const orderSchema = z.object({
  eventId: z.string(),
  tickets: z.array(
    z.object({
      categoryId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string().optional(),
  }),
  paymentMethod: z.enum(["credit", "upi", "wallet"]),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create an order" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const validatedData = orderSchema.parse(body);
    
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
      include: {
        ticketCategories: true,
      },
    });
    
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    
    // Verify ticket categories belong to the event and are available
    for (const ticketItem of validatedData.tickets) {
      const category = event.ticketCategories.find(
        (cat) => cat.id === ticketItem.categoryId
      );
      
      if (!category) {
        return NextResponse.json(
          { error: `Ticket category ${ticketItem.categoryId} not found for this event` },
          { status: 400 }
        );
      }
      
      // Check if there's a max quantity and if there are enough tickets available
      if (category.maxQuantity !== null) {
        // Count tickets already sold
        const soldTickets = await prisma.ticket.count({
          where: {
            categoryId: category.id,
          },
        });
        
        if (soldTickets + ticketItem.quantity > category.maxQuantity) {
          return NextResponse.json(
            { error: `Not enough tickets available for ${category.name}` },
            { status: 400 }
          );
        }
      }
    }
    
    // Calculate total amount to verify against the submitted amount
    const calculatedTotal = validatedData.tickets.reduce((total, ticketItem) => {
      const category = event.ticketCategories.find(
        (cat) => cat.id === ticketItem.categoryId
      );
      return total + (category?.price || 0) * ticketItem.quantity;
    }, 0);
    
    // Verify amount
    if (Math.abs(calculatedTotal - validatedData.amount) > 0.01) {
      return NextResponse.json(
        { error: "Order amount mismatch" },
        { status: 400 }
      );
    }
    
    // Create order
    const userId = session.user.id;
    
    // First create the order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: validatedData.amount,
        status: "PENDING",
      },
    });
    
    // Then create the tickets associated with the order
    const tickets = await Promise.all(
      validatedData.tickets.flatMap((ticketItem) =>
        Array.from({ length: ticketItem.quantity }).map(() =>
          prisma.ticket.create({
            data: {
              userId,
              eventId: validatedData.eventId,
              categoryId: ticketItem.categoryId,
              orderId: order.id,
              isCheckedIn: false,
            },
          })
        )
      ).flat()
    );
    
    return NextResponse.json(
      { 
        ...order, 
        tickets 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 