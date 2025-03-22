import { Suspense } from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';

// Event Search Component
const EventSearch = () => {
  return (
    <div className="mb-8">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Search Events</h2>
        <form>  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input 
                type="text" 
                placeholder="City or venue" 
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">All Categories</option>
                <option value="music">Music</option>
                <option value="business">Business</option>
                <option value="food">Food & Drink</option>
                <option value="arts">Arts</option>
                <option value="sports">Sports</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search Events
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event }: { event: any }) => {
  const formattedDate = new Date(event.startDateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = new Date(event.startDateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48 overflow-hidden">
        {event.bannerImage ? (
          <img 
            src={event.bannerImage} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          {event.isPaid ? `₹${event.price}` : 'FREE'}
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{formattedDate} • {formattedTime}</div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            By {event.organizer?.name || 'Unknown'}
          </div>
          <Link 
            href={`/events/${event.id}`}
            className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

// Event list component with loading state
const EventList = async () => {
  const getEvents = async () => {
    try {
      console.log("Querying events directly from database...");
      
      // Instead of using fetch, query prisma directly
      const events = await prisma.event.findMany({
        where: {
          isPublished: true,
        },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          ticketCategories: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: {
          startDateTime: 'asc',
        },
      });
      
      console.log(`Successfully fetched ${events.length} events directly from database`);
      return events;
    } catch (error) {
      console.error('Error fetching events from database:', error);
      // Return empty array to avoid breaking the component
      return [];
    }
  };

  const events = await getEvents();

  if (!events.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No events found</h3>
        <p className="text-gray-600 mb-4">Try changing your search criteria or check back later.</p>
        <Link 
          href="/dashboard/organizer/events/create"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create an Event
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

const EventLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 w-2/3 rounded animate-pulse mb-4" />
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Events</h1>
        <p className="text-gray-600 mt-2">Discover upcoming events that match your interests</p>
      </div>
      
      <EventSearch />
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="flex space-x-2">
            <button className="text-sm text-gray-600 hover:text-blue-600">
              Latest
            </button>
            <button className="text-sm text-gray-600 hover:text-blue-600">
              Popular
            </button>
            <button className="text-sm text-gray-600 hover:text-blue-600">
              Free
            </button>
          </div>
        </div>
        
        <Suspense fallback={<EventLoadingSkeleton />}>
          <EventList />
        </Suspense>
      </div>
    </div>
  );
} 