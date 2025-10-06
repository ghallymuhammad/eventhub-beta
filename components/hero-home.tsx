'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function HeroHome() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/events?search=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page or filter events
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };
  return (
    <>
      {/* Hero Banner Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden pt-0">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-100/20 to-pink-100/20 rounded-full blur-3xl animate-pulse pointer-events-none -z-10" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-100/10 rounded-full blur-2xl animate-pulse pointer-events-none -z-10" style={{ animationDelay: '4s' }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Hero Headline */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-gray-900 leading-none mb-6 tracking-tight">
                Create
                <span className="block font-extralight text-gray-600">experiences</span>
                <span className="block font-medium">that matter</span>
              </h1>
              <p className="text-xl md:text-2xl font-light text-gray-500 max-w-3xl mx-auto leading-relaxed">
                The simplest way to discover extraordinary events or create your own
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search for events..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full h-16 px-6 pl-16 text-lg bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 transition-all duration-200 placeholder:text-gray-400"
                />
                <svg
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-4 py-2 border-b">
                        {searchResults.length} event(s) found
                      </div>
                      {searchResults.map((event: any) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.category} • {event.location}</div>
                          <div className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                /* Guest CTAs */
                <>
                  <a
                    href="#featured-events"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Explore Events
                  </a>
                  <Link
                    href="/signin"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Sign in to get started
                  </Link>
                </>
              ) : user.role === 'user' ? (
                /* User CTAs */
                <>
                  <a
                    href="#featured-events"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Discover Events
                  </a>
                  <Link
                    href="/transactions"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    My Tickets
                  </Link>
                </>
              ) : (
                /* Organizer CTAs */
                <>
                  <Link
                    href="/create-event"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Create Event
                  </Link>
                  <Link
                    href="/organizer"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
            
            {/* Scroll indicator */}
            <div className="mt-16">
              <a
                href="#featured-events"
                className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section id="featured-events" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Happening now
            </h2>
            <p className="text-xl font-light text-gray-500 max-w-2xl mx-auto">
              Curated events from around the world
            </p>
          </div>

          {/* Event Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Event Card 1 - SIMPLE VERSION */}
            <a 
              href="/events/rock-concert-2025"
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer block no-underline"
              style={{ textDecoration: 'none' }}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-red-400 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                    Music
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-1">Rock Concert 2025</h3>
                  <p className="text-sm opacity-80">Jakarta, Indonesia</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500">Oct 15, 2025</div>
                  <div className="text-lg font-semibold text-gray-900">$45</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>👆 CLICK ME - Rock Concert</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Event Card 2 - SIMPLE VERSION */}
            <a 
              href="/events/tech-workshop"
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer block no-underline"
              style={{ textDecoration: 'none' }}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-green-400 to-blue-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                    Workshop
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-1">Tech Workshop</h3>
                  <p className="text-sm opacity-80">Bandung, Indonesia</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500">Oct 20, 2025</div>
                  <div className="text-lg font-semibold text-gray-900">Free</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>👆 CLICK ME - Tech Workshop</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            {/* Event Card 3 - SIMPLE VERSION */}
            <a 
              href="/events/art-exhibition"
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer block no-underline"
              style={{ textDecoration: 'none' }}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-indigo-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                    Arts
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-1">Art Exhibition</h3>
                  <p className="text-sm opacity-80">Yogyakarta, Indonesia</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-500">Nov 5, 2025</div>
                  <div className="text-lg font-semibold text-gray-900">$15</div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>👆 CLICK ME - Art Exhibition</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          {/* View More Button */}
          <div className="text-center space-y-4">
            <a
              href="#all-events"
              className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              View All Events
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            

          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find events that match your interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Category Items */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-semibold text-gray-900">Music</h3>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-900">Business</h3>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900">Arts</h3>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚽</span>
              </div>
              <h3 className="font-semibold text-gray-900">Sports</h3>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍕</span>
              </div>
              <h3 className="font-semibold text-gray-900">Food</h3>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎭</span>
              </div>
              <h3 className="font-semibold text-gray-900">Theater</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Events Created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
              <div className="text-blue-100">Event Organizers</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
