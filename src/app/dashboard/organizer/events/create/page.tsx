"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ticketCategories, setTicketCategories] = useState<any[]>([
    { name: "General Admission", description: "Standard entry", price: 0, maxQuantity: null }
  ]);
  
  // Add the copyToClipboard function inside the component where it has access to state
  const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setMessage('Copied to clipboard!');
        } else {
          setError('Failed to copy to clipboard');
        }
      } catch (err) {
        setError('Copy to clipboard is not supported in this browser');
      }
      
      document.body.removeChild(textArea);
      return;
    }
    
    // Modern browsers
    navigator.clipboard.writeText(text)
      .then(() => {
        setMessage('Copied to clipboard!');
        setTimeout(() => setMessage(''), 2000);
      })
      .catch(() => {
        setError('Failed to copy to clipboard');
      });
  };

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
  
  // Redirect if not authenticated or not an organizer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ORGANIZER") {
      router.push("/dashboard");
    }
  }, [status, session, router]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (type === "number") {
      // Ensure price is always a number (never undefined)
      if (name === "price") {
        setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
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
    
    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    
    // Check file size (max 3MB)
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      setError("Image size should not exceed 3MB");
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
  
  // Handle main banner upload 
  const handleMainBannerUpload = async () => {
    if (!imageFile) {
      setError("Please select an image first");
      return;
    }
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("isMainBanner", "true");
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload main banner");
      }
      
      const result = await response.json();
      setMessage("Image set as main banner successfully!");
      
    } catch (err) {
      console.error("Error uploading main banner:", err);
      setError(err instanceof Error ? err.message : "Failed to upload main banner");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add ticket category
  const handleAddTicketCategory = () => {
    setTicketCategories(prev => [
      ...prev,
      { name: "", description: "", price: 0, maxQuantity: null }
    ]);
  };
  
  // Handle remove ticket category
  const handleRemoveTicketCategory = (index: number) => {
    setTicketCategories(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle ticket category change
  const handleTicketCategoryChange = (index: number, field: string, value: any) => {
    setTicketCategories(prev => {
      const updated = [...prev];
      if (field === "price" || field === "maxQuantity") {
        updated[index][field] = value === "" ? (field === "price" ? 0 : null) : Number(value);
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      
      // Validate form data
      const validationResult = eventSchema.safeParse(formData);
      if (!validationResult.success) {
        const formattedErrors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
        setIsLoading(false);
        return;
      }
      
      // Validate ticket categories
      let ticketCategoryErrors = false;
      ticketCategories.forEach((category, index) => {
        const categoryValidation = ticketCategorySchema.safeParse(category);
        if (!categoryValidation.success) {
          ticketCategoryErrors = true;
          setError(`Ticket category ${index + 1} has invalid data`);
        }
      });
      
      if (ticketCategoryErrors) {
        setIsLoading(false);
        return;
      }
      
      // Validate dates
      const startDate = new Date(formData.startDateTime);
      const endDate = new Date(formData.endDateTime);
      const now = new Date();
      
      if (startDate < now) {
        setErrors(prev => ({ ...prev, startDateTime: "Start date must be in the future" }));
        setIsLoading(false);
        return;
      }
      
      if (endDate <= startDate) {
        setErrors(prev => ({ ...prev, endDateTime: "End date must be after start date" }));
        setIsLoading(false);
        return;
      }
      
      // Upload image if selected
      let imageUrl = "";
      if (imageFile) {
        // In a real app, you would upload to a storage service here
        // For this demo, we'll simulate it
        
        // Create FormData
        const formDataForImage = new FormData();
        formDataForImage.append("file", imageFile);
        
        // Upload image
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataForImage,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }
      
      // Prepare event data
      const eventData = {
        ...formData,
        bannerImage: imageUrl,
        ticketCategories,
      };
      
      // Create event
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }
      
      // Success
      const eventResult = await response.json();
      setMessage("Event created successfully!");
      
      // Redirect to event page after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/organizer`);
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If not authenticated yet, show loading
  if (status === "loading" || (status === "authenticated" && session?.user?.role !== "ORGANIZER")) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-72 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <Link 
            href="/dashboard/organizer"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition"
          >
            Cancel
          </Link>
        </div>
        <p className="text-gray-600 mt-2">Create a new event and invite attendees</p>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {message}
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.title ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                placeholder="Enter event title"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`block w-full rounded-md border ${errors.description ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                placeholder="Describe your event in detail"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${errors.location ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                placeholder="Event venue or online link"
                required
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.startDateTime ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.startDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDateTime}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${errors.endDateTime ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.endDateTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDateTime}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-32 object-cover rounded-md" 
                      />
                      <div className="mt-2 flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={handleMainBannerUpload}
                          className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          title="Set this image as the homepage main banner"
                        >
                          Set as Main Banner
                        </button>
                      </div>
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 3MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Tickets & Attendance</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                This is a paid event
              </label>
            </div>
            
            {formData.isPaid && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`block w-full rounded-md border ${errors.price ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required={formData.isPaid}
                />
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
                step="1"
                className={`block w-full rounded-md border ${errors.maxAttendees ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              />
              {errors.maxAttendees && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
              )}
            </div>
            
            {/* Ticket Categories */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Ticket Categories</h3>
                <button
                  type="button"
                  onClick={handleAddTicketCategory}
                  className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Category
                </button>
              </div>
              
              <div className="space-y-4">
                {ticketCategories.map((category, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Category {index + 1}</h4>
                      {ticketCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTicketCategory(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleTicketCategoryChange(index, 'name', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. VIP, Standard, Early Bird"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={category.price === null ? 0 : category.price}
                          onChange={(e) => handleTicketCategoryChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={category.description || ""}
                          onChange={(e) => handleTicketCategoryChange(index, 'description', e.target.value)}
                          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Optional description"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Quantity (leave empty for unlimited)
                        </label>
                        <input
                          type="number"
                          value={category.maxQuantity || ""}
                          onChange={(e) => handleTicketCategoryChange(index, 'maxQuantity', e.target.value)}
                          min="1"
                          step="1"
                          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Publishing Options</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
              Publish event immediately (otherwise it will be saved as draft)
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/organizer"
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Event...
              </span>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 