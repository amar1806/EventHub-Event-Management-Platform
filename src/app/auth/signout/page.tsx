"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically sign out and redirect to home page
    const handleSignOut = async () => {
      try {
        await signOut({ callbackUrl: "/" });
      } catch (error) {
        console.error("Error during sign out:", error);
        // Fallback redirect if signOut doesn't redirect automatically
        router.push("/");
      }
    };
    
    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Signing out...</h1>
        <p className="text-gray-600 mb-4">Please wait while we sign you out.</p>
        <p className="text-gray-500 text-sm">
          You will be automatically redirected to the home page.
        </p>
      </div>
    </div>
  );
} 