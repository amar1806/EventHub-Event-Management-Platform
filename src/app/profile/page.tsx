"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/users/${session.user.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const data = await response.json();
          setUserData(data.user);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load profile data');
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setIsLoading(false);
        setError('Please log in to view your profile');
      }
    };
    
    fetchUserData();
  }, [status, session]);
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="flex flex-col items-center sm:flex-row sm:items-start">
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 sm:mb-0 sm:mr-6"></div>
            <div className="flex-1 text-center sm:text-left">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
            </div>
          </div>
          <div className="mt-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link href="/auth/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  // If we have user data, display the profile
  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 sm:mb-0 sm:mr-6 flex items-center justify-center overflow-hidden">
            {userData?.image ? (
              <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-4xl text-gray-400">{userData?.name?.charAt(0) || 'U'}</div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-1">{userData?.name || 'User'}</h1>
            <p className="text-gray-600 mb-2">{userData?.email}</p>
            <div className="mb-4">
              <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                userData?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                userData?.role === 'ORGANIZER' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {userData?.role || 'ATTENDEE'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link 
                href="/dashboard" 
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
              
              <Link 
                href="/profile/edit" 
                className="bg-gray-100 text-gray-700 px-4 py-2 text-sm rounded-md hover:bg-gray-200"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Member since</h3>
              <p>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Two-factor Authentication</h3>
              <p>{userData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          
          {userData?.role === 'ORGANIZER' && (
            <div className="mt-6">
              <h3 className="text-gray-500 text-sm mb-1">Organizer Info</h3>
              <Link 
                href="/dashboard/organizer/events" 
                className="text-blue-600 hover:underline"
              >
                Manage your events
              </Link>
            </div>
          )}
          
          {userData?.role === 'ATTENDEE' && (
            <div className="mt-6">
              <h3 className="text-gray-500 text-sm mb-1">Attendee Info</h3>
              <Link 
                href="/dashboard/attendee" 
                className="text-blue-600 hover:underline"
              >
                View your tickets
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 