"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isActive = (path: string) => {
    return pathname === path
      ? "text-blue-600 font-medium"
      : "text-gray-600 hover:text-blue-600";
  };

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="bg-white shadow">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 font-bold text-xl text-blue-600">
            EventHub
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm ${isActive(item.href)}`}
            >
              {item.name}
            </Link>
          ))}
          
          {session?.user?.role === "ORGANIZER" && (
            <Link
              href="/my-events"
              className={`text-sm ${isActive("/my-events")}`}
            >
              My Events
            </Link>
          )}
          
          {session?.user?.role === "ATTENDEE" && (
            <Link
              href="/dashboard/attendee"
              className={`text-sm ${isActive("/dashboard/attendee")}`}
            >
              My Tickets
            </Link>
          )}
          
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/dashboard/admin"
              className={`text-sm ${isActive("/dashboard/admin")}`}
            >
              Admin
            </Link>
          )}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoading ? (
            <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`text-sm ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 py-3 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-base ${isActive(item.href)}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {session?.user?.role === "ORGANIZER" && (
              <Link
                href="/my-events"
                className={`block py-2 text-base ${isActive("/my-events")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Events
              </Link>
            )}
            
            {session?.user?.role === "ATTENDEE" && (
              <Link
                href="/dashboard/attendee"
                className={`block py-2 text-base ${isActive("/dashboard/attendee")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Tickets
              </Link>
            )}
            
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/dashboard/admin"
                className={`block py-2 text-base ${isActive("/dashboard/admin")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block py-2 text-base ${isActive("/dashboard")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block py-2 text-base ${isActive("/profile")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/auth/two-factor/setup"
                  className={`block py-2 text-base ${isActive("/auth/two-factor/setup")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Two-Factor Authentication
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="block w-full text-left py-2 text-base text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-4 flex flex-col space-y-3">
                <Link
                  href="/auth/login"
                  className="block text-center py-2 text-base text-gray-600 border border-gray-300 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="block text-center py-2 text-base text-white bg-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}