"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getGravatarUrl } from '@/utils/gravatar';

interface WishlistItem {
  id: string;
  eventId: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    bannerImage: string | null;
    startDateTime: string;
    endDateTime: string;
    location: string;
    price: number;
    organizer: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'wishlist'>('info');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`/api/users/${session.user.id}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch wishlist
        const wishlistResponse = await fetch('/api/events/wishlist');
        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setWishlist(wishlistData.wishlist || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };

    fetchUserData();
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
        // Remove from local state
        setWishlist(prev => prev.filter(item => item.eventId !== eventId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h1 className="text-xl text-red-800">Error</h1>
          <p className="mt-2 text-red-600">{error || 'User data not found'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 md:h-48"></div>
        
        <div className="px-4 py-6 md:px-6 md:py-8 -mt-20 relative">
          <div className="flex flex-col md:flex-row md:items-end">
            <div className="w-32 h-32 mx-auto md:mx-0 mb-4 md:mb-0 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {userData.image ? (
                <Image 
                  src={userData.image} 
                  alt={userData.name || 'User'} 
                  width={128} 
                  height={128} 
                  className="object-cover w-full h-full"
                />
              ) : userData.email ? (
                <Image 
                  src={getGravatarUrl(userData.email)} 
                  alt={userData.name || 'User'} 
                  width={128} 
                  height={128} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left md:ml-6 md:pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {userData.name || 'Your Profile'}
              </h1>
              
              <div className="mt-1 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userData.role === 'ORGANIZER' ? 'Event Organizer' : userData.role.toLowerCase()}
                </span>
                {userData.createdAt && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Joined {format(new Date(userData.createdAt), 'MMM yyyy')}
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <Link href="/profile/edit" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('info')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'wishlist' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Wishlist
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'info' ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {userData.bio ? (
                    <p className="text-gray-700 whitespace-pre-line">{userData.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio provided</p>
                  )}

                  {userData.website && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Website:</p>
                      <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {userData.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Security Settings */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/auth/change-password" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Password
                    </Link>
                    <Link 
                      href="/auth/two-factor" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Two-Factor Authentication
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact/Details panel */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {userData.gender && (
                      <div>
                        <p className="text-sm text-gray-500">Gender:</p>
                        <p className="text-gray-900">{userData.gender.replace('_', ' ')}</p>
                      </div>
                    )}
                    
                    {userData.birthday && (
                      <div>
                        <p className="text-sm text-gray-500">Birthday:</p>
                        <p className="text-gray-900">{format(new Date(userData.birthday), 'PPP')}</p>
                      </div>
                    )}
                    
                    {userData.address && (
                      <div>
                        <p className="text-sm text-gray-500">Location:</p>
                        <p className="text-gray-900">{userData.address}</p>
                      </div>
                    )}
                    
                    {userData.phoneNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Phone:</p>
                        <p className="text-gray-900">{userData.phoneNumber}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Email:</p>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Wishlist</h2>
              </div>
              
              {wishlist.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No wishlist items</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't added any events to your wishlist yet.
                  </p>
                  <div className="mt-6">
                    <Link href="/events" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Browse Events
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        {item.event.bannerImage ? (
                          <Image 
                            src={item.event.bannerImage} 
                            alt={item.event.title} 
                            width={400} 
                            height={200} 
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <button 
                          onClick={() => removeFromWishlist(item.event.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-500 hover:text-red-600"
                          aria-label="Remove from wishlist"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <Link href={`/events/${item.event.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600">{item.event.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(item.event.startDateTime), 'PPP')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.event.location}
                        </p>
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.event.price === 0 ? 'Free' : `₹${item.event.price}`}
                          </p>
                          <Link href={`/users/${item.event.organizer.id}`} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                            {item.event.organizer.image && (
                              <Image 
                                src={item.event.organizer.image} 
                                alt={item.event.organizer.name || ''} 
                                width={20} 
                                height={20} 
                                className="w-5 h-5 rounded-full mr-1"
                              />
                            )}
                            <span>{item.event.organizer.name}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}