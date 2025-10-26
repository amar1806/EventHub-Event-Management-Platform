// Server Component
import { Suspense } from 'react';
import EventDetailClient from './event-detail-client';

// Main page component
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // Normalize params whether Next provides a Promise or a plain object
  const { id: eventId } = await params;

  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailClient eventId={eventId} />
    </Suspense>
  );
}

// Skeleton loader for the event details
function EventDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-2">Loading event details...</span>
      </div>
    </div>
  );
} 