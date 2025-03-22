"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

// Stats Card Component
const StatsCard = ({ title, value, icon, bgColor }: { title: string; value: string | number; icon: React.ReactNode; bgColor: string }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-md ${bgColor} p-3 mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">{title}</h3>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Organizer Dashboard Page
const OrganizerDashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Get current user's ID from the session (this would be set when logged in)
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
        
        // Calculate stats
        const published = data.events.filter((event: any) => event.isPublished).length;
        const totalAttendees = data.events.reduce((acc: number, event: any) => acc + (event._count?.tickets || 0), 0);
        const totalRevenue = data.events.reduce((acc: number, event: any) => {
          const ticketsSold = event._count?.tickets || 0;
          return acc + (event.price * ticketsSold);
        }, 0);
        
        setStats({
          totalEvents: data.events.length,
          publishedEvents: published,
          totalAttendees,
          totalRevenue,
        });
      } catch (err) {
        setError('Could not load your events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [router]);

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
        method: 'PUT',
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
      
      // Update stats
      const publishedCount = isPublished 
        ? stats.publishedEvents + 1 
        : stats.publishedEvents - 1;
      
      setStats({
        ...stats,
        publishedEvents: publishedCount,
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update event status. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your events and track attendees</p>
        </div>
        <Link
          href="/dashboard/organizer/events/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Event
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={
            <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          bgColor="bg-purple-100"
        />
        
        <StatsCard
          title="Published Events"
          value={stats.publishedEvents}
          icon={
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-green-100"
        />
        
        <StatsCard
          title="Total Attendees"
          value={stats.totalAttendees}
          icon={
            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          bgColor="bg-blue-100"
        />
        
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={
            <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-yellow-100"
        />
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'published'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drafts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past
          </button>
        </nav>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2" />
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">No events created yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first event.</p>
              <Link href="/dashboard/organizer/events/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Create Event
              </Link>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No {activeTab} events found</h3>
              <p className="text-gray-600">Try selecting a different filter or create a new event.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onPublishToggle={handlePublishToggle}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerDashboard; 