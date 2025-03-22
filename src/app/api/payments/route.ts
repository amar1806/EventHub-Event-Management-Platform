import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";

// Base payment schema
const basePaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(["credit", "upi", "wallet"]),
  amount: z.number().positive(),
});

// Credit card payment schema
const creditCardPaymentSchema = basePaymentSchema.extend({
  paymentMethod: z.literal("credit"),
  cardDetails: z.object({
    number: z.string().min(13).max(19),
    expiry: z.string(),
    cvv: z.string().min(3).max(4),
  }),
});

// UPI payment schema
const upiPaymentSchema = basePaymentSchema.extend({
  paymentMethod: z.literal("upi"),
  upiId: z.string(),
});

// Wallet payment schema
const walletPaymentSchema = basePaymentSchema.extend({
  paymentMethod: z.literal("wallet"),
});

// Combined payment schema using discriminated union
const paymentSchema = z.discriminatedUnion("paymentMethod", [
  creditCardPaymentSchema,
  upiPaymentSchema,
  walletPaymentSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to process a payment" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const validatedData = paymentSchema.parse(body);
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        tickets: {
          include: {
            event: true,
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Verify the user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to process this payment" },
        { status: 403 }
      );
    }
    
    // Verify order is in a valid state
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "This order cannot be processed" },
        { status: 400 }
      );
    }
    
    // Verify payment amount
    if (Math.abs(order.totalAmount - validatedData.amount) > 0.01) {
      return NextResponse.json(
        { error: "Payment amount does not match order total" },
        { status: 400 }
      );
    }
    
    // In a real app, we would process the payment with a payment gateway here
    // For this demo, we'll simulate a successful payment
    
    // Generate a payment reference
    const paymentReference = `PAY-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: validatedData.amount,
        status: "COMPLETED", // For demo, assume all payments succeed
        paymentMethod: validatedData.paymentMethod,
        transactionId: paymentReference,
      },
    });
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CONFIRMED", // Using CONFIRMED instead of COMPLETED as per schema
      },
      include: {
        tickets: true,
      },
    });
    
    // In a real app, we would send confirmation emails here
    
    return NextResponse.json({
      success: true,
      payment,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
