"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function MyEventsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      // Redirect based on user role
      if (session.user.role === "ORGANIZER") {
        router.push("/dashboard/organizer");
      } else if (session.user.role === "ATTENDEE") {
        router.push("/dashboard/attendee");
      } else if (session.user.role === "ADMIN") {
        router.push("/dashboard/admin");
      }
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold mb-2">आपको रीडायरेक्ट किया जा रहा है...</h2>
        <p className="text-gray-600">अपने इवेंट्स देखने के लिए कृपया प्रतीक्षा करें</p>
      </div>
    </div>
  );
} 