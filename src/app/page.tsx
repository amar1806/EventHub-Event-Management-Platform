"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">EventHub</span>
                <span className="block text-blue-200">Events Made Easy</span>
              </h1>
              <p className="mt-6 max-w-md text-xl text-blue-100">
                Organize, discover, and attend events with ease. EventHub makes event management simple for everyone.
              </p>
              <div className="mt-8 flex space-x-4">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href="/auth/register"
                      className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium shadow-md"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/events"
                      className="bg-transparent text-white border border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-md font-medium"
                    >
                      Browse Events
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/dashboard"
                      className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium shadow-md"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/events"
                      className="bg-transparent text-white border border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-md font-medium"
                    >
                      Browse Events
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md h-80 bg-white bg-opacity-10 rounded-lg shadow-xl overflow-hidden">
                <div className="w-full h-full relative">
                  <img 
                    src="/images/mainevent.jpg" 
                    alt="Event Image" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show fallback placeholder
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-blue-800 bg-opacity-50 flex items-center justify-center text-white">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-2xl font-semibold">Event Image</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
      </div>
      {/* Role-specific features section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features for Everyone</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Different features for different users. Experience the platform based on your role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Attendee Features */}
          <div className={`rounded-lg p-8 shadow-md ${session?.user?.role === 'ATTENDEE' ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-blue-50'}`}>
            <div className="w-16 h-16 bg-blue-100 rounded-full mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Attendees</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Discover events</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Book tickets</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Manage your tickets</span>
              </li>
            </ul>
            <div className="mt-6">
              {session?.user?.role === 'ATTENDEE' ? (
                <Link href="/dashboard/attendee" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Go to My Tickets
                </Link>
              ) : !session ? (
                <Link href="/auth/register?role=ATTENDEE" className="inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Register as Attendee →
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">You are currently registered as {session.user.role}</span>
              )}
            </div>
          </div>

          {/* Organizer Features */}
          <div className={`rounded-lg p-8 shadow-md ${session?.user?.role === 'ORGANIZER' ? 'bg-green-50 ring-2 ring-green-200' : 'bg-green-50'}`}>
            <div className="w-16 h-16 bg-green-100 rounded-full mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Organizers</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Create events</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Manage attendees</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track revenue</span>
              </li>
            </ul>
            <div className="mt-6">
              {session?.user?.role === 'ORGANIZER' ? (
                <Link href="/dashboard/organizer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Go to Organizer Dashboard
                </Link>
              ) : !session ? (
                <Link href="/auth/register?role=ORGANIZER" className="inline-block text-green-600 hover:text-green-800 font-medium">
                  Register as Organizer →
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">You are currently registered as {session.user.role}</span>
              )}
            </div>
          </div>

          {/* Admin Features */}
          <div className={`rounded-lg p-8 shadow-md ${session?.user?.role === 'ADMIN' ? 'bg-purple-50 ring-2 ring-purple-200' : 'bg-purple-50'}`}>
            <div className="w-16 h-16 bg-purple-100 rounded-full mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Admins</h3>
            
            {session?.user?.role === 'ADMIN' ? (
              <>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Manage user accounts</span>
          </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Process event approvals</span>
          </li>
                </ul>
                <div className="mt-6">
                  <Link href="/dashboard/admin" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    Go to Admin Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">Admin features restricted. These features are only available to platform administrators.</p>
                <div className="mt-6">
                  <span className="text-gray-500 text-sm">Admin access is restricted</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Check out some upcoming events happening on our platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* This would typically be fetched from your database */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="text-sm text-blue-600 mb-2">Jul 15, 2024 • Delhi</div>
                  <h3 className="text-xl font-semibold mb-2">Tech Conference {i}</h3>
                  <p className="text-gray-600 mb-4">Join us for the biggest tech event of the year with speakers from all around the world.</p>
                  <Link href={`/events/${i}`} className="text-blue-600 font-medium hover:text-blue-800">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/events" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700">
              View All Events
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Take your events to the next level with EventHub. Register now.
          </p>
          <div className="flex justify-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/auth/register"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium shadow-md"
                >
                  Sign Up Now
                </Link>
                <Link
                  href="/about"
                  className="bg-transparent text-white border border-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-md font-medium"
                >
                  Learn More
                </Link>
              </>
            ) : (
              <Link 
                href="/dashboard"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-medium shadow-md"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
