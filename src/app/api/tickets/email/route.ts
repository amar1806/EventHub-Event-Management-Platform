import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email';

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
    
    // Get request data
    const { orderId, email } = await req.json();
    
    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Order ID and email are required" },
        { status: 400 }
      );
    }
    
    // Get the order with tickets and event information
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        tickets: {
          include: {
            category: true,
          }
        },
        event: true,
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this order
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this order" },
        { status: 403 }
      );
    }
    
    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };
    
    // Format time
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };
    
    // Generate tickets HTML
    const ticketsHtml = order.tickets.map((ticket: any) => `
      <div style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <div style="border-bottom: 1px solid #e0e0e0; padding-bottom: 15px; margin-bottom: 15px;">
          <h3 style="font-size: 18px; margin: 0 0 5px 0;">${order.event?.title || 'Event'}</h3>
          <p style="margin: 0; color: #666;">
            ${order.event?.startDateTime ? formatDate(order.event.startDateTime.toString()) : 'Date not available'} • 
            ${order.event?.startDateTime ? formatTime(order.event.startDateTime.toString()) : 'Time not available'}
          </p>
          <p style="margin: 5px 0 0 0; color: #666;">${order.event?.location || 'Location not available'}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <p style="font-weight: bold; margin: 0;">Ticket Type</p>
            <p style="margin: 5px 0 0 0;">${ticket.category?.name || 'Standard Ticket'}</p>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0;">Price</p>
            <p style="margin: 5px 0 0 0;">₹${ticket.category?.price || 0}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; border-top: 1px dashed #e0e0e0; padding-top: 15px;">
          <div>
            <p style="font-weight: bold; margin: 0;">Ticket ID</p>
            <p style="margin: 5px 0 0 0;">${ticket.id}</p>
          </div>
          <div>
            <p style="font-weight: bold; margin: 0;">Status</p>
            <p style="margin: 5px 0 0 0; color: ${ticket.status === 'USED' ? '#e53e3e' : '#38a169'};">
              ${ticket.status === 'USED' ? 'Used' : 'Valid'}
            </p>
          </div>
        </div>
      </div>
    `).join('');
    
    // Create email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4a7aff; margin: 0;">Your Tickets</h1>
          <p style="color: #666;">Order #${order.id}</p>
        </div>
        
        <div style="background-color: #fff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="margin-top: 0;">Event Details</h2>
          <p><strong>Event:</strong> ${order.event?.title || 'Event'}</p>
          <p><strong>Date:</strong> ${order.event?.startDateTime ? formatDate(order.event.startDateTime.toString()) : 'Date not available'}</p>
          <p><strong>Time:</strong> ${order.event?.startDateTime ? formatTime(order.event.startDateTime.toString()) : 'Time not available'}</p>
          <p><strong>Location:</strong> ${order.event?.location || 'Location not available'}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2>Your Tickets</h2>
          ${ticketsHtml}
        </div>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="margin-top: 0;">Order Summary</h2>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Number of Tickets:</strong> ${order.tickets.length}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Thank you for using EventHub!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;
    
    // Send email
    await sendEmail({
      to: email,
      subject: `Your Tickets for ${order.event?.title || 'Event'}`,
      text: `Your tickets for ${order.event?.title || 'Event'} are attached. Thank you for your purchase.`,
      html: emailHtml,
    });
    
    return NextResponse.json({
      success: true,
      message: "Tickets sent successfully"
    });
  } catch (error) {
    console.error("Error sending tickets via email:", error);
    return NextResponse.json(
      { error: "Failed to send tickets via email" },
      { status: 500 }
    );
  }
} 