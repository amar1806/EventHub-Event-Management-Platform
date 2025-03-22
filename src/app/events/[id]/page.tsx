import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';

// Event Detail Component with Loading State
const EventDetail = async ({ eventId }: { eventId: string }) => {
  // This would fetch data directly from the database
  const getEvent = async () => {
    try {
      console.log(`Fetching event with ID: ${eventId} directly from database`);
      
      // Use Prisma to query the database directly
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
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
      });
      
      if (!event) {
        console.error('Event not found');
        return null;
      }
      
      return event;
    } catch (error) {
      console.error('Error fetching event from database:', error);
      throw error; // Propagate the error
    }
  };

  let event;
  try {
    event = await getEvent();
    
    if (!event) {
      notFound();
    }
  } catch (error) {
    console.error('Failed to load event:', error);
    throw new Error(`Failed to load event: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Organizer</h2>
            <div className="flex items-center">
              {event.organizer?.image ? (
                <img 
                  src={event.organizer.image} 
                  alt={event.organizer.name || "Organizer"} 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full mr-4 bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {event.organizer?.name?.charAt(0) || "O"}
                </div>
              )}
              <div>
                <div className="font-medium">{event.organizer?.name || "Unknown Organizer"}</div>
                {event.organizer?.id && (
                  <Link href={`/organizers/${event.organizer.id}`} className="text-sm text-blue-600 hover:underline">
                    Organizer's Profile
                  </Link>
                )}
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
              <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const EventDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-6">
      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
    </div>
    
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
        
        <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-2 md:space-y-0 md:space-x-6">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-8 w-2/3"></div>
        
        <div className="h-64 bg-gray-200 rounded animate-pulse mb-6"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t">
          <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetail eventId={params.id} />
    </Suspense>
  );
} 