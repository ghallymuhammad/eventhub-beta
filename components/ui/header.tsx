'use client';

import Link from "next/link";
import Logo from "./logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (localStorage for permanent, sessionStorage for demo)
    const userData = localStorage.getItem('user') || sessionStorage.getItem('mockSession');
    if (userData) {
      const parsedData = JSON.parse(userData);
      // Normalize the data structure
      if (parsedData.user) {
        // Mock session format
        setUser({
          email: parsedData.user.email,
          role: parsedData.user.role.toLowerCase(),
          name: parsedData.user.name,
          isAuthenticated: true,
        });
      } else {
        // Direct user format
        setUser(parsedData);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('mockSession');
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const isGuest = !user;
  const isUser = user?.role === 'user';
  const isOrganizer = user?.role === 'organizer';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      {/* Floating Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Logo />
      </div>

      {/* Center Navigation - Only for authenticated users */}
      {!isGuest && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
          <nav className="flex items-center space-x-1 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-3 border border-white/20">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
            >
              Events
            </Link>
            {isOrganizer && (
              <>
                <Link
                  href="/create-event"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                >
                  Create
                </Link>
                <Link
                  href="/organizer"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                >
                  Dashboard
                </Link>
              </>
            )}
            {isUser && (
              <>
                <Link
                  href="/transactions"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                >
                  Tickets
                </Link>
                <Link
                  href="/reviews"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
                >
                  Reviews
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Floating Right Actions */}
      <div className="absolute top-6 right-6 z-10">
        {isGuest ? (
          /* Guest actions - Floating */
          <div className="flex items-center space-x-3">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg px-4 py-3 border border-white/20">
              <Link
                href="/signin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
            <div className="bg-black/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/10">
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-3 text-sm font-medium text-white hover:bg-gray-800/90 rounded-2xl transition-all duration-200 transform hover:scale-105"
              >
                Get started
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated user actions - Floating */
          <div className="flex items-center space-x-3">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg px-4 py-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  {isOrganizer && (
                    <div className="text-xs text-blue-600">Organizer</div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu button - Floating */}
      <div className="md:hidden absolute top-6 right-6 z-20">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
          <button
            className="p-3 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - Full screen overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl">
          <nav className="pt-20 px-6 space-y-6">
            <Link
              href="/"
              className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            
            {/* User-only navigation */}
            {isUser && (
              <>
                <Link
                  href="/transactions"
                  className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tickets
                </Link>
                <Link
                  href="/reviews"
                  className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reviews
                </Link>
              </>
            )}

            {/* Organizer-only navigation */}
            {isOrganizer && (
              <>
                <Link
                  href="/create-event"
                  className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
                <Link
                  href="/organizer"
                  className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Mobile auth actions */}
            {isGuest ? (
              <div className="space-y-6 pt-8">
                <Link
                  href="/signin"
                  className="block text-2xl font-light text-gray-900 hover:text-gray-600 transition-colors py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center px-6 py-4 text-xl font-medium text-white bg-black rounded-3xl hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div className="pt-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-900">{user.name}</div>
                    {isOrganizer && <div className="text-sm text-blue-600">Organizer</div>}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-2xl font-light text-gray-500 hover:text-gray-700 transition-colors py-3"
                >
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
