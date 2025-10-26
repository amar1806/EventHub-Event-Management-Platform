"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Types
interface TicketCategory {
  id: string;
  name: string;
  description: string;
  price: number;
  maxQuantity: number | null;
}

interface Event {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  description: string;
  location: string;
  organizerId: string;
  imageUrl: string;
  price: number;
  category: string;
  ticketCategories: TicketCategory[];
}

interface PageParams {
  id: string;
}

export default function EventRegistrationPage({ params }: { params: any }) {
  // Use React.use to access params in client component
  const { id: eventId } = React.use(params) as unknown as { id: string };
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketSelections, setTicketSelections] = useState<{[key: string]: number}>({});
  const [step, setStep] = useState<"tickets" | "checkout" | "payment" | "confirmation">("tickets");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "upi" | "wallet">("credit");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    upiId: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        console.log(`Fetching event details for event ID: ${eventId}`);
        
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load event details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Received event data:", data);
        
        // Safety check for data
        if (!data) {
          throw new Error("No data received from API");
        }
        
        // Extract the correct event data structure
        let eventData = data;
        
        // Handle response formats - data might be directly the event object or inside an event property
        if (data.event) {
          eventData = data.event;
        }
        
        // Initialize ticketCategories if missing
        if (!eventData.ticketCategories) {
          eventData.ticketCategories = [];
          console.log("No ticket categories found, initializing with empty array");
        }
        
        // Ensure it's an array
        if (!Array.isArray(eventData.ticketCategories)) {
          console.error("Invalid ticket categories format, not an array", eventData);
          eventData.ticketCategories = [];
        }
        
        // If no ticket categories are available, try to seed them
        if (eventData.ticketCategories.length === 0) {
          console.log("No ticket categories found, attempting to seed them...");
          
          try {
            const seedResponse = await fetch(`/api/seed?eventId=${eventId}`);
            if (seedResponse.ok) {
              const seedData = await seedResponse.json();
              console.log("Successfully seeded ticket categories:", seedData);
              
              if (seedData.data && Array.isArray(seedData.data)) {
                eventData.ticketCategories = seedData.data;
                console.log(`Added ${seedData.data.length} ticket categories to event data`);
              }
            } else {
              console.error("Failed to seed ticket categories", await seedResponse.text());
            }
          } catch (seedError) {
            console.error("Error seeding ticket categories:", seedError);
          }
        }
        
        console.log("Final event data with ticket categories:", eventData);
        setEvent(eventData);
        
        // Initialize ticket selections with 0 for each category
        const initialSelections: {[key: string]: number} = {};
        if (eventData.ticketCategories) {
          eventData.ticketCategories.forEach((category: TicketCategory) => {
            initialSelections[category.id] = 0;
          });
        }
        setTicketSelections(initialSelections);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Pre-fill form data from session if available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Get total tickets
  const getTotalTickets = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);
  };

  // Calculate total
  const calculateTotal = () => {
    if (!event || !event.ticketCategories) return 0;
    
    return event.ticketCategories.reduce((total, category) => {
      const quantity = ticketSelections[category.id] || 0;
      return total + (category.price * quantity);
    }, 0);
  };

  // Handle ticket quantity change
  const handleQuantityChange = (categoryId: string, action: "increase" | "decrease") => {
    if (!event || !event.ticketCategories) return;
    
    setTicketSelections(prev => {
      const category = event.ticketCategories.find(c => c.id === categoryId);
      if (!category) return prev;
      
      const currentQty = prev[categoryId] || 0;
      let newQty = currentQty;
      
      if (action === "increase" && (category.maxQuantity === null || currentQty < category.maxQuantity)) {
        newQty = currentQty + 1;
      } else if (action === "decrease" && currentQty > 0) {
        newQty = currentQty - 1;
      }
      
      return { ...prev, [categoryId]: newQty };
    });
  };

  // Enhanced handleProceedToCheckout with better error messaging and validation
  const handleProceedToCheckout = () => {
    if (!event) {
      setError("Unable to load event information. Please refresh the page.");
      return;
    }
    
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      setError("No tickets available for this event.");
      return;
    }
    
    if (getTotalTickets() === 0) {
      setError("Please select at least one ticket to continue.");
      return;
    }
    
    setError("");
    setStep("checkout");
  };

  // Improved card number formatter
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Enhanced handleInputChange with special handling for card fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      setFormData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === 'cardExpiry') {
      // Format MM/YY
      const expiry = value.replace(/\D/g, '');
      if (expiry.length <= 2) {
        setFormData(prev => ({ ...prev, [name]: expiry }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [name]: `${expiry.slice(0, 2)}/${expiry.slice(2, 4)}` 
        }));
      }
    } else if (name === 'cardCvv') {
      // Only allow numbers for CVV
      const cvv = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cvv }));
    } else {
      // Normal handling for other fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setError("");
    setStep("payment");
  };

  // Add a timeout to simulate payment processing for better UX
  const simulatePaymentProcessing = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000); // 2 seconds delay
    });
  };

  // Enhanced handlePaymentSubmission with better debugging
  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Better validation based on payment method
    if (paymentMethod === "credit") {
      if (!formData.cardNumber) {
        setError("Please enter your card number");
        return;
      }
      
      // Improved card number validation
      const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumberClean)) {
        setError("Please enter a valid 16-digit card number");
        return;
      }
      
      if (!formData.cardExpiry) {
        setError("Please enter your card expiry date");
        return;
      }
      
      // Improved expiry date validation
      if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        setError("Please enter the correct expiry date format (MM/YY)");
        return;
      }
      
      // Check if card is expired
      const [expMonth, expYear] = formData.cardExpiry.split('/');
      const expiryDate = new Date();
      expiryDate.setFullYear(2000 + parseInt(expYear), parseInt(expMonth), 0);
      const today = new Date();
      
      if (expiryDate < today) {
        setError("Your card has expired. Please use another card");
        return;
      }
      
      if (!formData.cardCvv) {
        setError("Please enter your card CVV");
        return;
      }
      
      if (!/^\d{3}$/.test(formData.cardCvv)) {
        setError("CVV must be 3 digits");
        return;
      }
    }
    
    if (paymentMethod === "upi") {
      if (!formData.upiId) {
        setError("Please enter your UPI ID");
        return;
      }
      
      // Basic UPI validation
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(formData.upiId)) {
        setError("Please enter a valid UPI ID (example@bank)");
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      setError("");
      
      // Verify we're still logged in
      if (status !== "authenticated") {
        setError("Your session has expired. Please log in again");
        router.push(`/auth/login?callbackUrl=/events/${eventId}/register`);
        return;
      }
      
      // Make sure we have the user ID
      if (!session?.user?.id) {
        setError("User ID not found. Please log in again");
        router.push(`/auth/login?callbackUrl=/events/${eventId}/register`);
        return;
      }
      
      // Prepare filtered ticket selections (only those with quantity > 0)
      const ticketItems = Object.entries(ticketSelections)
        .filter(([_, quantity]) => quantity > 0)
        .map(([categoryId, quantity]) => ({
          categoryId,
          quantity,
        }));
      
      // Check if there are any tickets selected
      if (ticketItems.length === 0) {
        setError("Please select at least one ticket");
        return;
      }
      
      // Calculate total amount
      const totalAmount = calculateTotal();
      if (totalAmount <= 0) {
        setError("Total amount must be greater than zero");
        return;
      }
      
      // Prepare order data
      const orderData = {
        eventId: eventId,
        tickets: ticketItems,
        customerInfo: {
          name: formData.name || session.user.name || "",
          email: formData.email || session.user.email || "",
          phone: formData.phone,
          address: formData.address || "",
        },
        paymentMethod: paymentMethod,
        amount: totalAmount,
      };
      
      console.log("Sending order data:", JSON.stringify(orderData, null, 2));
      
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      
      console.log("Order response status:", orderResponse.status);
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Order creation error:", errorData);
        throw new Error(errorData.error || "Failed to create order.");
      }
      
      const orderResult = await orderResponse.json();
      console.log("Order created successfully:", orderResult);
      
      // Set order ID for confirmation
      setOrderId(orderResult.id);
      
      // Add slight delay for better UX
      await simulatePaymentProcessing();
      
      // Process payment with properly typed data
      const paymentData: {
        orderId: string;
        paymentMethod: "credit" | "upi" | "wallet";
        amount: number;
        cardDetails?: {
          number: string;
          expiry: string;
          cvv: string;
        };
        upiId?: string;
      } = {
        orderId: orderResult.id,
        paymentMethod: paymentMethod,
        amount: totalAmount,
      };
      
      // Add payment method specific details
      if (paymentMethod === "credit") {
        paymentData.cardDetails = {
          number: formData.cardNumber.replace(/\s/g, ''),
          expiry: formData.cardExpiry,
          cvv: formData.cardCvv,
        };
      } else if (paymentMethod === "upi") {
        paymentData.upiId = formData.upiId;
      }
      
      console.log("Sending payment data:", JSON.stringify(paymentData, null, 2));
      
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
      
      console.log("Payment response status:", paymentResponse.status);
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("Payment processing error:", errorData);
        throw new Error(errorData.error || "Failed to process payment.");
      }
      
      const paymentResult = await paymentResponse.json();
      console.log("Payment processed successfully:", paymentResult);
      
      // Set order confirmed
      setOrderConfirmed(true);
      
      // Move to confirmation step
      setStep("confirmation");
    } catch (error) {
      console.error("Error during checkout:", error);
      setError(error instanceof Error ? error.message : "Something went wrong during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-72 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4 mb-6">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
        <Link href="/events" className="text-blue-600 hover:underline">
          Browse Events
        </Link>
      </div>
    );
  }

  // If event is null, show a friendly message
  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          Unable to load event details. Please try again later.
        </div>
        <Link href="/events" className="text-blue-600 hover:underline">
          Browse Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/events/${eventId}`} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to event
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex flex-col items-center ${step === "tickets" ? "text-blue-600" : "text-gray-500"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === "tickets" ? "bg-blue-600 text-white" : step === "checkout" || step === "payment" || step === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="text-xs mt-1">Select Tickets</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${step === "checkout" || step === "payment" || step === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${step === "checkout" ? "text-blue-600" : step === "payment" || step === "confirmation" ? "text-green-600" : "text-gray-500"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === "checkout" ? "bg-blue-600 text-white" : step === "payment" || step === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="text-xs mt-1">Your Details</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${step === "payment" || step === "confirmation" ? "bg-green-600" : "bg-gray-200"}`}></div>
          </div>
          <div className={`flex flex-col items-center ${step === "payment" || step === "confirmation" ? "text-green-600" : "text-gray-500"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === "payment" || step === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
            <span className="text-xs mt-1">Payment</span>
          </div>
        </div>
      </div>

      {/* Render confirmation step */}
      {step === "confirmation" && orderConfirmed ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your tickets have been booked successfully.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="flex flex-col md:flex-row md:justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{orderId}</p>
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Payment Successful
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{event?.title || 'Event'}</h3>
              <p className="text-gray-600">
                {event?.startDateTime ? new Date(event.startDateTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : 'Date unavailable'}
                {event?.startDateTime ? (' • ' + new Date(event.startDateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })) : ''}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Ticket Details</p>
              <div className="space-y-2">
                {Object.entries(ticketSelections).map(([categoryId, quantity]) => {
                  if (quantity > 0) {
                    const category = event?.ticketCategories?.find(c => c.id === categoryId);
                    return (
                      <div key={categoryId} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm4 4h8a1 1 0 010 2H8a1 1 0 110-2zm-4 6h12a1 1 0 010 2H4a1 1 0 010-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">{category?.name}</p>
                            <p className="text-sm text-gray-500">x{quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(category?.price || 0) * quantity}</p>
                          <p className="text-xs text-gray-500">₹{category?.price} per ticket</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">₹{calculateTotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600">Platform Fee</p>
                <p className="font-medium">₹0.00</p>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                <p>Total Amount</p>
                <p>₹{calculateTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link 
              href={`/dashboard/attendee/tickets/${orderId}`} 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
              </svg>
              View Tickets
            </Link>
            <Link 
              href="/events" 
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              Browse More Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tickets Selection */}
          {step === "tickets" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Tickets</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-medium mb-2">{event.title}</h2>
                <p className="text-gray-600">
                  {event.startDateTime ? new Date(event.startDateTime).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : 'Date not available'}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-4">Available Tickets</h3>
                
                {!event.ticketCategories || event.ticketCategories.length === 0 ? (
                  <p className="text-gray-500">No tickets available for this event.</p>
                ) : (
                  <div className="space-y-4">
                    {event.ticketCategories.map((category) => (
                      <div key={category.id} className="p-6 bg-white rounded-lg shadow-md flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-medium mb-2">{category.name}</h4>
                          <p className="text-gray-600">{category.description}</p>
                          <p className="text-gray-600 mt-2">
                            <span className="font-medium">₹{category.price}</span> per ticket
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleQuantityChange(category.id, "decrease")}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-md hover:bg-gray-300"
                            disabled={(ticketSelections[category.id] || 0) <= 0}
                          >
                            -
                          </button>
                          <span className="px-3">{ticketSelections[category.id] || 0}</span>
                          <button 
                            onClick={() => handleQuantityChange(category.id, "increase")}
                            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-md hover:bg-gray-300"
                            disabled={category.maxQuantity !== null && (ticketSelections[category.id] || 0) >= (category.maxQuantity || 0)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <p className="text-lg font-medium mb-2">Total: ₹{calculateTotal().toFixed(2)}</p>
                <button 
                  onClick={handleProceedToCheckout} 
                  disabled={getTotalTickets() === 0 || !event.ticketCategories || event.ticketCategories.length === 0}
                  className={`w-full py-3 rounded-md font-medium text-white ${
                    getTotalTickets() > 0 && event.ticketCategories && event.ticketCategories.length > 0
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!event.ticketCategories || event.ticketCategories.length === 0
                    ? "No Tickets Available" 
                    : getTotalTickets() === 0
                      ? "Please Select Tickets"
                      : `Proceed to Checkout (₹${calculateTotal().toFixed(2)})`
                  }
                </button>
              </div>
            </div>
          )}

          {/* Checkout */}
          {step === "checkout" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea 
                    name="address" 
                    id="address" 
                    value={formData.address} 
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    rows={3}
                  />
                </div>
                
                <div>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 w-full"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment */}
          {step === "payment" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handlePaymentSubmission} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="mt-1 space-y-2">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="credit" 
                        checked={paymentMethod === "credit"} 
                        onChange={() => setPaymentMethod("credit")} 
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Credit Card</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="upi" 
                        checked={paymentMethod === "upi"} 
                        onChange={() => setPaymentMethod("upi")} 
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">UPI</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="wallet" 
                        checked={paymentMethod === "wallet"} 
                        onChange={() => setPaymentMethod("wallet")} 
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Wallet</span>
                    </label>
                  </div>
                </div>
                
                {paymentMethod === "credit" && (
                  <div>
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                        Card Number
                      </label>
                      <input 
                        type="text" 
                        name="cardNumber" 
                        id="cardNumber" 
                        value={formData.cardNumber} 
                        onChange={handleInputChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <input 
                          type="text" 
                          name="cardExpiry" 
                          id="cardExpiry" 
                          value={formData.cardExpiry} 
                          onChange={handleInputChange} 
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700">
                          CVV
                        </label>
                        <input 
                          type="text" 
                          name="cardCvv" 
                          id="cardCvv" 
                          value={formData.cardCvv} 
                          onChange={handleInputChange} 
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === "upi" && (
                  <div>
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">
                      UPI ID
                    </label>
                    <input 
                      type="text" 
                      name="upiId" 
                      id="upiId" 
                      value={formData.upiId} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                )}
                
                <div>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 w-full flex items-center justify-center"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${calculateTotal().toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
