"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { z } from "zod";

// Form schema for validation
const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  startDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid start date/time"),
  endDateTime: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid end date/time"),
  bannerImage: z.string().optional(),
  isPaid: z.boolean(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  maxAttendees: z.number().int().positive("Max attendees must be positive").optional(),
  isPublished: z.boolean(),
});

// Ticket category schema
const ticketCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  maxQuantity: z.number().int().positive("Max quantity must be positive").nullable(),
});

export default function EditEventPage({ params }: { params: any }) {
  // Use React.use to properly access params
  const { id: eventId } = React.use(params) as unknown as { id: string };
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ticketCategories, setTicketCategories] = useState<any[]>([]);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    bannerImage: "",
    isPaid: false,
    price: 0,
    maxAttendees: undefined as number | undefined,
    isPublished: false,
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch event data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    
    if (status === "authenticated" && session?.user?.role !== "ORGANIZER" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    
    const fetchEvent = async () => {
      try {
        setIsLoadingEvent(true);
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        
        const eventData = await response.json();
        
        // Check if user has permission to edit this event
        if (session?.user?.role !== "ADMIN" && eventData.organizerId !== session?.user?.id) {
          router.push("/dashboard/organizer");
          return;
        }
        
        // Format dates for form inputs
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        };
        
        setFormData({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startDateTime: formatDateForInput(eventData.startDateTime),
          endDateTime: formatDateForInput(eventData.endDateTime),
          bannerImage: eventData.bannerImage || "",
          isPaid: eventData.isPaid,
          price: eventData.price || 0,
          maxAttendees: eventData.maxAttendees,
          isPublished: eventData.isPublished,
        });
        
        if (eventData.bannerImage) {
          setImagePreview(eventData.bannerImage);
        }
        
        // Set ticket categories
        if (eventData.ticketCategories && eventData.ticketCategories.length > 0) {
          setTicketCategories(eventData.ticketCategories);
        } else {
          // Default ticket category if none exists
          setTicketCategories([
            { name: "General Admission", description: "Standard entry", price: eventData.isPaid ? eventData.price : 0, maxQuantity: null }
          ]);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setIsLoadingEvent(false);
      }
    };
    
    if (eventId && status === "authenticated") {
      fetchEvent();
    }
  }, [eventId, status, session, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      
      // If event is set to free, reset price to 0
      if (name === "isPaid" && !checked) {
        setFormData(prev => ({ ...prev, price: 0 }));
      }
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should not exceed 5MB");
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle ticket category changes
  const handleTicketCategoryChange = (index: number, field: string, value: any) => {
    const updatedCategories = [...ticketCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: field === "price" || field === "maxQuantity" ? 
        (value === "" ? null : Number(value)) : value
    };
    setTicketCategories(updatedCategories);
  };
  
  // Add new ticket category
  const addTicketCategory = () => {
    setTicketCategories([
      ...ticketCategories,
      { name: "", description: "", price: 0, maxQuantity: null }
    ]);
  };
  
  // Remove ticket category
  const removeTicketCategory = (index: number) => {
    if (ticketCategories.length > 1) {
      const updatedCategories = ticketCategories.filter((_, i) => i !== index);
      setTicketCategories(updatedCategories);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    try {
      // Validate form data
      const validationResult = eventSchema.safeParse(formData);
      if (!validationResult.success) {
        const formattedErrors: Record<string, string> = {};
        validationResult.error.issues.forEach(issue => {
          formattedErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(formattedErrors);
        setError("Please fix the form errors before submitting.");
        return;
      }
      
      // Validate ticket categories
      let ticketCategoriesValid = true;
      ticketCategories.forEach((category, index) => {
        const result = ticketCategorySchema.safeParse(category);
        if (!result.success) {
          ticketCategoriesValid = false;
          setError(`Invalid ticket category #${index + 1}. Please check all fields.`);
        }
      });
      
      if (!ticketCategoriesValid) {
        return;
      }
      
      setIsLoading(true);
      
      // Upload image if a new one is selected
      let imageUrl = formData.bannerImage;
      if (imageFile) {
        const formDataForImage = new FormData();
        formDataForImage.append("file", imageFile);
        
        const imageUploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataForImage,
        });
        
        if (!imageUploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const imageData = await imageUploadResponse.json();
        imageUrl = imageData.url;
      }
      
      // Prepare request data
      const requestData = {
        ...formData,
        bannerImage: imageUrl,
        ticketCategories: ticketCategories.map(category => ({
          ...category,
          id: category.id || undefined // Keep existing IDs, make new ones undefined
        }))
      };
      
      // Send update request
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to update event");
      }
      
      setMessage("Event updated successfully!");
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/organizer");
      }, 2000);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err instanceof Error ? err.message : "Failed to update event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingEvent) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/organizer" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.title ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                  placeholder="e.g., Annual Tech Conference 2024"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={`block w-full rounded-md border ${errors.description ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                  placeholder="Describe your event in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.location ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                  placeholder="e.g., Convention Center, Mumbai"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Date and Time */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Date and Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date and Time *
                </label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.startDateTime ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.startDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDateTime}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date and Time *
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.endDateTime ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.endDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDateTime}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Banner Image */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Banner Image</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image (Max 5MB)
                </label>
                <input
                  type="file"
                  id="bannerImage"
                  name="bannerImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Recommended size: 1200x600 pixels. JPG, PNG formats accepted.
                </p>
              </div>
              
              <div>
                {imagePreview ? (
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-1">Image Preview</p>
                    <img
                      src={imagePreview}
                      alt="Event banner preview"
                      className="mt-2 max-h-48 rounded-md border border-gray-300"
                    />
                  </div>
                ) : (
                  <div className="mt-2 flex justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">No image selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Ticketing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ticketing</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isPaid"
                    name="isPaid"
                    type="checkbox"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="isPaid" className="font-medium text-gray-700">
                    This is a paid event
                  </label>
                  <p className="text-gray-500 text-sm">
                    Check this if attendees need to purchase tickets
                  </p>
                </div>
              </div>
              
              {formData.isPaid && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <div className="relative rounded-md shadow-sm max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="any"
                      className={`block w-full rounded-md border ${errors.price ? 'border-red-300' : 'border-gray-300'} pl-7 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              )}
              
              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  id="maxAttendees"
                  name="maxAttendees"
                  value={formData.maxAttendees || ""}
                  onChange={handleInputChange}
                  min="1"
                  className={`block max-w-xs rounded-md border ${errors.maxAttendees ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                  placeholder="e.g., 100"
                />
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Ticket Categories */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ticket Categories</h2>
              <button
                type="button"
                onClick={addTicketCategory}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Category
              </button>
            </div>
            
            <div className="space-y-4">
              {ticketCategories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Ticket Category #{index + 1}</h3>
                    {ticketCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketCategory(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`category-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id={`category-name-${index}`}
                        value={category.name}
                        onChange={(e) => handleTicketCategoryChange(index, "name", e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., VIP, Early Bird, etc."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`category-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        id={`category-description-${index}`}
                        value={category.description || ""}
                        onChange={(e) => handleTicketCategoryChange(index, "description", e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Short description of this ticket type"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`category-price-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          id={`category-price-${index}`}
                          value={category.price || 0}
                          onChange={(e) => handleTicketCategoryChange(index, "price", e.target.value)}
                          min="0"
                          step="any"
                          className="block w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor={`category-quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity (leave empty for unlimited)
                      </label>
                      <input
                        type="number"
                        id={`category-quantity-${index}`}
                        value={category.maxQuantity || ""}
                        onChange={(e) => handleTicketCategoryChange(index, "maxQuantity", e.target.value)}
                        min="1"
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Publishing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Publishing</h2>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isPublished"
                  name="isPublished"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="isPublished" className="font-medium text-gray-700">
                  Publish this event
                </label>
                <p className="text-gray-500 text-sm">
                  Published events are visible to attendees and available for registration
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
            <Link
              href="/dashboard/organizer"
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 