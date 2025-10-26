"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import Image from 'next/image';
import { getGravatarUrl } from '@/utils/gravatar';

// Event Detail Client Component
export default function EventDetailClient({ eventId }: { eventId: string }) {
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          setError(`Failed to load event: ${response.statusText}`);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        setEvent(data);

        // Check for like count and status in a different API call
        const likeResponse = await fetch(`/api/events/like?eventId=${eventId}`);
        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          if (typeof likeData.likeCount === 'number') {
            setLikeCount(likeData.likeCount);
          }
          if (typeof likeData.isLiked === 'boolean') {
            setIsLiked(likeData.isLiked);
          }
        }
      } catch (error) {
        setError("Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Check wishlist status
  useEffect(() => {
    if (session?.user?.id && event) {
      const checkWishlist = async () => {
        try {
          const response = await fetch('/api/events/wishlist');
          if (response.ok) {
            const data = await response.json();
            const isInList = data.wishlist.some((item: any) => item.eventId === event.id);
            setIsInWishlist(isInList);
          }
        } catch (error) {
          console.error('Error checking wishlist:', error);
        }
      };

      checkWishlist();
    }
  }, [session, event]);

  const toggleWishlist = async (eventId: string) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/events/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        setIsInWishlist(prev => !prev);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const toggleLike = async (eventId: string) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/events/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.action === 'liked');
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>Error: {error}</p>
          <p className="mt-2">Please try again later or contact support.</p>
        </div>
        <Link href="/events" className="text-blue-600 hover:underline">
          Browse other events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-6">
          <p>Event not found</p>
        </div>
        <Link href="/events" className="text-blue-600 hover:underline">
          Browse other events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/events" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Events
        </Link>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="h-64 bg-gray-300 relative">
          {event.bannerImage ? (
            <img 
              src={event.bannerImage} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          
          {event.isPaid && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              ₹{event.price}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="flex items-center mr-6 mb-2 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700">
                {isSameDay ? (
                  formatDate(startDate)
                ) : (
                  `${formatDate(startDate)} - ${formatDate(endDate)}`
                )}
              </span>
            </div>
            
            <div className="flex items-center mr-6 mb-2 md:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">
                {formatTime(startDate)} - {formatTime(endDate)}
              </span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700">{event.location}</span>
            </div>
          </div>
          
          {event.maxAttendees && (
            <div className="mb-6 bg-blue-50 p-3 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-blue-700 font-medium">Limited Capacity: {event.maxAttendees} attendees</span>
                </div>
                <div className="text-sm text-blue-600">
                  {/* In a real app, you would show actual registration count */}
                  {Math.floor(Math.random() * event.maxAttendees)} already registered
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Event Description</h2>
            <div className="text-gray-700 prose max-w-none">
              {event.description.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
          
          {event.ticketCategories && event.ticketCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Ticket Options</h2>
              <div className="space-y-4">
                {event.ticketCategories.map((category: any) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{category.name}</h3>
                        <p className="text-gray-600 text-sm">{category.description}</p>
                      </div>
                      <div className="text-lg font-semibold">
                        ₹{category.price}
                      </div>
                    </div>
                    {category.maxQuantity && (
                      <div className="mt-2 text-sm text-gray-500">
                        Only {category.maxQuantity} tickets available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Event Organizer</h3>
            <div className="mt-2 flex items-center">
              <div className="flex-shrink-0">
                {event.organizer.image ? (
                  <img 
                    src={event.organizer.image}
                    alt={event.organizer.name || 'Event Organizer'}
                    className="h-12 w-12 rounded-full"
                  />
                ) : event.organizer.email ? (
                  <img 
                    src={getGravatarUrl(event.organizer.email, 96)}
                    alt={event.organizer.name || 'Event Organizer'}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">{event.organizer.name || 'Unknown Organizer'}</h4>
                <Link 
                  href={`/users/${event.organizer.id}`}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Organizer Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div>
              {event.isPaid ? (
                <div className="text-2xl font-bold text-gray-900">
                  ₹{event.price} <span className="text-sm font-normal text-gray-500">per person</span>
                </div>
              ) : (
                <div className="text-lg font-medium text-green-600">
                  Free Event
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Link href={`/events/${event.id}/register`} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Register Now
              </Link>
              <button
                onClick={() => toggleWishlist(event.id)}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isInWishlist ? (
                  <>
                    <svg className="mr-2 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Wishlist
                  </>
                )}
              </button>
              <button
                onClick={() => toggleLike(event.id)}
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLiked ? (
                  <>
                    <svg className="mr-2 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {likeCount}
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {likeCount}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 