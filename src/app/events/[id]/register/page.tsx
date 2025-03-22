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
  maxQuantity: number;
}

interface Event {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  isPaid: boolean;
  price: number;
  ticketCategories: TicketCategory[];
}

export default function EventRegistrationPage() {
  // Use useParams hook to get the event ID
  const params = useParams();
  const eventId = params.id as string;
  
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
        
        // Validate ticketCategories exists and is an array
        if (!data.ticketCategories || !Array.isArray(data.ticketCategories)) {
          console.error("No ticket categories found in response or invalid format", data);
          data.ticketCategories = []; // Ensure it's at least an empty array to prevent errors
        }
        
        if (data.ticketCategories && data.ticketCategories.length === 0) {
          console.log("No ticket categories found for this event. Will try to fetch from seed API.");
          
          // Try to seed ticket categories for this event
          try {
            const seedResponse = await fetch(`/api/seed?eventId=${eventId}`, {
              method: "GET",
            });
            
            if (seedResponse.ok) {
              console.log("Successfully seeded ticket categories, refreshing event data...");
              // Fetch the event again to get the newly created ticket categories
              const refreshResponse = await fetch(`/api/events/${eventId}`);
              if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                setEvent(refreshedData);
                
                // Initialize ticket selections with the refreshed data
                const initialSelections: {[key: string]: number} = {};
                if (refreshedData.ticketCategories) {
                  refreshedData.ticketCategories.forEach((category: TicketCategory) => {
                    initialSelections[category.id] = 0;
                  });
                }
                setTicketSelections(initialSelections);
                setLoading(false);
                return;
              }
            } else {
              console.error("Failed to seed ticket categories", await seedResponse.text());
            }
          } catch (seedError) {
            console.error("Error seeding ticket categories:", seedError);
          }
        }
        
        setEvent(data);
        
        // Initialize ticket selections with 0 for each category
        const initialSelections: {[key: string]: number} = {};
        if (data.ticketCategories) {
          console.log(`Initializing selections for ${data.ticketCategories.length} ticket categories`);
          data.ticketCategories.forEach((category: TicketCategory) => {
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

  // Handle ticket quantity change
  const handleQuantityChange = (categoryId: string, action: "increase" | "decrease") => {
    setTicketSelections(prev => {
      const category = event?.ticketCategories.find(c => c.id === categoryId);
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

  // Calculate total
  const calculateTotal = () => {
    if (!event) return 0;
    
    return event.ticketCategories.reduce((total, category) => {
      const quantity = ticketSelections[category.id] || 0;
      return total + (category.price * quantity);
    }, 0);
  };

  // Get total tickets
  const getTotalTickets = () => {
    return Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);
  };

  // Enhanced handleProceedToCheckout with better error messaging and validation
  const handleProceedToCheckout = () => {
    // First, verify if event data is loaded correctly
    if (!event) {
      setError("Unable to load event information. Please refresh the page.");
      return;
    }
    
    // Check if there are no ticket categories 
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      setError("No tickets available for this event.");
      return;
    }
    
    // Check if user has selected tickets
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
        router.push(`/auth/signin?callbackUrl=/events/${eventId}/register`);
        return;
      }
      
      // Make sure we have the user ID
      if (!session?.user?.id) {
        setError("User ID not found. Please log in again");
        router.push(`/auth/signin?callbackUrl=/events/${eventId}/register`);
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
        throw new Error(errorData.error || "Payment processing failed.");
      }
      
      const paymentResult = await paymentResponse.json();
      console.log("Payment processed successfully:", paymentResult);
      
      // Payment successful
      setOrderId(orderResult.id);
      setOrderConfirmed(true);
      setStep("confirmation");
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again");
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

  // Render confirmation step
  if (step === "confirmation" && orderConfirmed) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
              <h3 className="text-lg font-medium mb-2">{event?.title}</h3>
              <p className="text-gray-600">
                {event?.startDateTime && new Date(event.startDateTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {event?.startDateTime && (' • ' + new Date(event.startDateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }))}
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Ticket Details</p>
              <div className="space-y-2">
                {Object.entries(ticketSelections).map(([categoryId, quantity]) => {
                  if (quantity > 0) {
                    const category = event?.ticketCategories.find(c => c.id === categoryId);
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
          <div className={`flex flex-col items-center ${step === "payment" ? "text-blue-600" : step === "confirmation" ? "text-green-600" : "text-gray-500"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${step === "payment" ? "bg-blue-600 text-white" : step === "confirmation" ? "bg-green-600 text-white" : "bg-gray-200"}`}>
              3
            </div>
            <span className="text-xs mt-1">Payment</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{step === "tickets" ? "Select Your Tickets" : step === "checkout" ? "Your Details" : "Payment"}</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Ticket Selection Step */}
        {step === "tickets" && event && (
          <div>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-2">{event.title}</h2>
              <p className="text-gray-600">
                {new Date(event.startDateTime).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-4">Available Tickets</h3>
              
              {event.ticketCategories.length === 0 ? (
                <p className="text-gray-500">No tickets available for this event.</p>
              ) : (
                <div className="space-y-4">
                  {event.ticketCategories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <p className="font-medium text-gray-900 mt-1">₹{category.price}</p>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleQuantityChange(category.id, "decrease")}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          disabled={ticketSelections[category.id] <= 0}
                        >
                          -
                        </button>
                        <span className="mx-3 w-5 text-center">{ticketSelections[category.id] || 0}</span>
                        <button 
                          onClick={() => handleQuantityChange(category.id, "increase")}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          disabled={category.maxQuantity !== null && ticketSelections[category.id] >= category.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between mb-2">
                <span>Tickets</span>
                <span>{getTotalTickets()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              
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
        
        {/* Checkout Step */}
        {step === "checkout" && (
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">Order Summary</h3>
              
              {Object.entries(ticketSelections).map(([categoryId, quantity]) => {
                if (quantity > 0) {
                  const category = event?.ticketCategories.find(c => c.id === categoryId);
                  return (
                    <div key={categoryId} className="flex justify-between mb-2">
                      <span>{quantity} x {category?.name}</span>
                      <span>₹{(category?.price || 0) * quantity}</span>
                    </div>
                  );
                }
                return null;
              })}
              
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <button 
                type="button"
                onClick={() => setStep("tickets")}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              
              <button 
                type="submit"
                className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        )}
        
        {/* Payment Step */}
        {step === "payment" && (
          <form onSubmit={handlePaymentSubmission} className="space-y-6">
            <div className="mb-6">
              <h3 className="font-medium mb-4">Payment Method</h3>
              
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit")}
                  className={`py-3 px-4 border rounded-md ${paymentMethod === "credit" ? "border-blue-600 bg-blue-50" : "border-gray-300"} flex items-center justify-center md:justify-start`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Credit Card
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`py-3 px-4 border rounded-md ${paymentMethod === "upi" ? "border-blue-600 bg-blue-50" : "border-gray-300"} flex items-center justify-center md:justify-start`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  UPI
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`py-3 px-4 border rounded-md ${paymentMethod === "wallet" ? "border-blue-600 bg-blue-50" : "border-gray-300"} flex items-center justify-center md:justify-start`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Wallet
                </button>
              </div>
            </div>
            
            {/* Credit Card Form with improved UX */}
            {paymentMethod === "credit" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      maxLength={19}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: XXXX XXXX XXXX XXXX</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        maxLength={5}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="cardCvv"
                        name="cardCvv"
                        placeholder="123"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        maxLength={3}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* UPI Form with improved UX */}
            {paymentMethod === "upi" && (
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    placeholder="yourname@bank"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required={paymentMethod === "upi"}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        To complete payment, you will receive a notification in your UPI app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Wallet Form with improved UX */}
            {paymentMethod === "wallet" && (
              <div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You will be redirected to complete payment using your digital wallet.
                      </p>
                    </div>
                  </div> 
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Paytm_logo.svg/2560px-Paytm_logo.svg.png" 
                      alt="Paytm" 
                      className="h-8 w-auto mx-auto"
                    />
                  </button>
                  <button
                    type="button"
                    className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png" 
                      alt="PhonePe" 
                      className="h-8 w-auto mx-auto"
                    />
                  </button>
                  <button
                    type="button"
                    className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" 
                      alt="Google Pay" 
                      className="h-8 w-auto mx-auto"
                    />
                  </button>
                  <button
                    type="button"
                    className="p-3 border border-gray-200 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Amazon_Pay_logo.svg/1280px-Amazon_Pay_logo.svg.png" 
                      alt="Amazon Pay" 
                      className="h-8 w-auto mx-auto"
                    />
                  </button>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">Payment Summary</h3>
              
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Service Fee</span>
                <span>₹0.00</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <button 
                type="button"
                onClick={() => setStep("checkout")}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              
              <button 
                type="submit"
                disabled={isProcessing}
                className={`py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${isProcessing ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 