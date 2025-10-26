"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        setLoading(false);
        setError('You must be logged in to view your wishlist');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/events/wishlist');
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [session, status]);

  const removeFromWishlist = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (response.ok) {
        // Remove the event from the local state
        setWishlist(prevWishlist => 
          prevWishlist.filter(item => item.eventId !== eventId)
        );
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading wishlist...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p>{error}</p>
        {!session && (
          <p className="mt-4">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Login to view your wishlist
            </Link>
          </p>
        )}
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Wishlist</h2>
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-gray-600">You haven't added any events to your wishlist yet.</p>
          <Link 
            href="/events" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Wishlist</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div 
            key={item.eventId} 
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-200 relative">
              {item.event.bannerImage ? (
                <img 
                  src={item.event.bannerImage} 
                  alt={item.event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              {item.event.isPaid && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-sm px-2 py-1 rounded">
                  ₹{item.event.price}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                {item.event.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-2 truncate">
                {new Date(item.event.startDateTime).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.event.description}
              </p>
              
              <div className="flex justify-between items-center">
                <Link 
                  href={`/events/${item.eventId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
                
                <button
                  onClick={() => removeFromWishlist(item.eventId)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 