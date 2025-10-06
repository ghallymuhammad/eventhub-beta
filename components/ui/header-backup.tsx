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
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const isGuest = !user;
  const isUser = user?.role === 'user';
  const isOrganizer = user?.role === 'organizer';

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Logo />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Events
              </Link>
            
              {/* User-only navigation */}
              {isUser && (
                <>
                  <Link
                    href="/transactions"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/reviews"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
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
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/organizer"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right side actions */}
            <div className="hidden md:flex flex-1 items-center justify-end gap-3">
              {isGuest ? (
                /* Guest actions */
                <>
                  <Link
                    href="/signin"
                    className="btn-sm bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-sm bg-gray-800 text-gray-200 shadow-sm hover:bg-gray-900"
                  >
                    Register
                  </Link>
                </>
              ) : (
                /* Authenticated user actions */
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user.name}</span>
                    {isOrganizer && <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Organizer</span>}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg border p-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              
              {/* User-only navigation */}
              {isUser && (
                <>
                  <Link
                    href="/transactions"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <Link
                    href="/reviews"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
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
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/organizer"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              )}

              {/* Mobile auth actions */}
              <div className="border-t pt-3 mt-3">
                {isGuest ? (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/signin"
                      className="btn-sm bg-white text-gray-800 shadow-sm hover:bg-gray-50 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-sm bg-gray-800 text-gray-200 shadow-sm hover:bg-gray-900 text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm text-gray-600 py-2">
                      Welcome, <span className="font-medium">{user.name}</span>
                      {isOrganizer && <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Organizer</span>}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-center"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
