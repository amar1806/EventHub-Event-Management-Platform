"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Ticket {
  id: string;
  status: string;
  ticketCategory: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  tickets: Ticket[];
  event: {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    location: string;
    bannerImage?: string;
    organizer: {
      id: string;
      name: string;
    };
  };
}

export default function TicketsPage({ params }: { params: { orderId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, router, params.orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to view this order");
        } else {
          throw new Error("Failed to load tickets");
        }
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
        <Link href="/dashboard/attendee" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          No ticket information available.
        </div>
        <Link href="/dashboard/attendee" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/attendee" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Dashboard dekho
        </Link>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">Order Confirmation</h1>
          <p className="text-blue-100">Order #{order.id}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{order.event.title}</h2>
                <p className="text-gray-600">{formatDate(order.event.startDateTime)}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap text-gray-600 text-sm mb-4">
              <div className="w-full md:w-1/2 mb-2 md:mb-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(order.event.startDateTime)} - {formatTime(order.event.endDateTime)}
              </div>
              <div className="w-full md:w-1/2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {order.event.location}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800 mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Payment Completed</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Your Tickets</h3>
            
            <div className="space-y-4">
              {order.tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{ticket.ticketCategory.name}</h4>
                      <div className="text-sm text-gray-500">Ticket #{ticket.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{ticket.ticketCategory.price}</div>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium">Event Info:</div>
                      <div>{order.event.title}</div>
                      <div>{formatDate(order.event.startDateTime)}</div>
                    </div>
                    
                    <button
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      onClick={() => alert("In a real app, this would download or display a printable ticket.")}
                    >
                      View Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Number of Tickets</span>
              <span>{order.tickets.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order Status</span>
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {order.status}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => alert("In a real app, this would email your tickets.")}
          >
            Email Tickets
          </button>
          <button 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            onClick={() => alert("In a real app, this would print all tickets.")}
          >
            Print All Tickets
          </button>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          href={`/events/${order.event.id}`} 
          className="text-blue-600 hover:underline flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          View Event Details
        </Link>
      </div>
    </div>
  );
} 