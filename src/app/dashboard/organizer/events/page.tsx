 "use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Event Card Component for the organizer dashboard
const EventCard = ({ event, onPublishToggle }: { event: any; onPublishToggle: (eventId: string, isPublished: boolean) => void }) => {
  const eventDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const attendeeCount = event._count?.tickets || 0;
  const capacity = event.maxAttendees || 'Unlimited';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-40 bg-gray-200">
        {event.bannerImage ? (
          <img 
            src={event.bannerImage} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white p-1 rounded-md shadow-sm">
          <div
            className={`${
              event.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            } text-xs font-bold px-2 py-1 rounded-sm`}
          >
            {event.isPublished ? 'PUBLISHED' : 'DRAFT'}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{event.title}</h3>
        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{attendeeCount} / {capacity}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <span className={`${event.isPaid ? 'text-blue-600' : 'text-green-600'} font-semibold`}>
              {event.isPaid ? `₹${event.price}` : 'FREE'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/organizer/events/${event.id}/attendees`}
              className="text-gray-600 hover:text-gray-900 text-sm border border-gray-300 px-2 py-1 rounded"
            >
              Attendees
            </Link>
            <Link
              href={`/dashboard/organizer/events/${event.id}/edit`}
              className="text-gray-600 hover:text-gray-900 text-sm border border-gray-300 px-2 py-1 rounded"
            >
              Edit
            </Link>
            <button
              onClick={() => onPublishToggle(event.id, !event.isPublished)}
              className={`text-sm px-2 py-1 rounded ${
                event.isPublished
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {event.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Organizer Events Page
export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect if not authenticated or not an organizer
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    } else if (status === "authenticated" && session?.user?.role !== "ORGANIZER") {
      router.push("/dashboard");
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events?userId=current');
        
        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError('Your events could not be loaded. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [router, status, session]);

  // Filter events based on active tab
  const filteredEvents = events.filter(event => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return event.isPublished;
    if (activeTab === 'drafts') return !event.isPublished;
    if (activeTab === 'upcoming') {
      const eventDate = new Date(event.startDateTime);
      const now = new Date();
      return eventDate >= now;
    }
    if (activeTab === 'past') {
      const eventDate = new Date(event.startDateTime);
      const now = new Date();
      return eventDate < now;
    }
    return true;
  });

  // Handle event publish/unpublish
  const handlePublishToggle = async (eventId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      // Update events in state
      setEvents(events.map(event => event.id === eventId ? { ...event, isPublished } : event));
    } catch (err) {
      console.error(err);
      alert('Failed to update event status. Please try again.');
    }
  };

  // If not authenticated yet or loading, show skeleton
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
      <p className="text-gray-600 mt-2">View and manage all your events here</p>
        </div>
        <Link
          href="/dashboard/organizer/events/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Event
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('published')}
            className={`py-2 px-1 ${
              activeTab === 'published'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Published
          </button>
          <button 
            onClick={() => setActiveTab('drafts')}
            className={`py-2 px-1 ${
              activeTab === 'drafts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Drafts
          </button>
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`py-2 px-1 ${
              activeTab === 'past'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
            }`}
          >
            Past
          </button>
        </nav>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Event grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onPublishToggle={handlePublishToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No events yet. Click the button above to create a new event.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/organizer/events/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}