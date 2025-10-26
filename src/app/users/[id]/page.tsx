"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
// Avoid importing Prisma types in client bundle; use a lightweight local shape
type EventShape = {
  id: string;
  title?: string;
  bannerImage?: string | null;
  startDateTime?: string | null;
  location?: string | null;
};

type UserWithEvents = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  bio?: string | null;
  birthday?: string | null;
  address?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  createdAt?: string | null;
  events?: EventShape[];
};
import { getGravatarUrl } from '@/utils/gravatar';

// (UserWithEvents already declared above)

export default function UserProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

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
          <p className="mt-2 text-red-600">{error || 'User not found'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.email === userData.email;

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
                {userData.name || 'Unnamed User'}
              </h1>
              
              <div className="mt-1 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userData.role === 'ORGANIZER' ? 'Event Organizer' : (userData.role ?? 'ATTENDEE').toLowerCase()}
                </span>
                {userData.createdAt && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Joined {format(new Date(String(userData.createdAt)), 'MMM yyyy')}
                  </span>
                )}
              </div>
              
              {isOwnProfile && (
                <div className="mt-4">
                  <Link href="/profile/edit" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* User details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {/* Events section */}
              {userData.role === 'ORGANIZER' && userData.events && userData.events.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Events by this Organizer</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.events.map((event: any) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {event.bannerImage && (
                            <div className="h-40 overflow-hidden">
                              <Image 
                                src={event.bannerImage} 
                                alt={event.title} 
                                width={500} 
                                height={200} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(event.startDateTime), 'PPP')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {event.location}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact/Details panel */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
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
        </div>
      </div>
    </div>
  );
}