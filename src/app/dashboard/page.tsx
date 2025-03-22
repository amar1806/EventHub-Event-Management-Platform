"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard');
      return;
    }
    
    if (session?.user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (session?.user?.role === 'ORGANIZER') {
      router.push('/dashboard/organizer');
    } else {
      router.push('/dashboard/attendee');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-60 bg-gray-100 rounded"></div>
        <p className="mt-4 text-gray-600">Your dashboard is loading, please wait...</p>
      </div>
    </div>
  );
} 