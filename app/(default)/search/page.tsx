'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  image?: string;
  organizer: string;
}

// Mock search results - in real app would fetch from API
const mockSearchResults = (query: string): Event[] => {
  const allEvents = [
    {
      id: 'rock-concert-2025',
      title: 'Rock Concert 2025',
      description: 'An electrifying night of rock music featuring top bands',
      date: '2025-10-15',
      time: '8:00 PM',
      location: 'Jakarta Convention Center, Jakarta, Indonesia',
      category: 'Music',
      price: '$45',
      organizer: 'Rock Events Indonesia'
    },
    {
      id: 'tech-workshop',
      title: 'Tech Workshop 2025',
      description: 'Learn cutting-edge technologies from industry experts',
      date: '2025-10-20',
      time: '9:00 AM',
      location: 'Bandung Institute of Technology, Bandung, Indonesia',
      category: 'Workshop',
      price: 'Free',
      organizer: 'Tech Community Bandung'
    },
    {
      id: 'art-exhibition',
      title: 'Art Exhibition',
      description: 'Contemporary art from emerging artists',
      date: '2025-11-05',
      time: '10:00 AM',
      location: 'Yogya Art Gallery, Yogyakarta, Indonesia',
      category: 'Arts',
      price: '$15',
      organizer: 'Yogya Art Gallery'
    }
  ];

  return allEvents.filter(event => 
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.description.toLowerCase().includes(query.toLowerCase()) ||
    event.category.toLowerCase().includes(query.toLowerCase()) ||
    event.location.toLowerCase().includes(query.toLowerCase())
  );
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const results = mockSearchResults(query);
      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  }, [query]);

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {query ? `Showing results for "${query}"` : 'Enter a search query to find events'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Searching events...</p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && query && (
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {searchResults.length} event{searchResults.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer block no-underline"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute top-6 left-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                          {event.category}
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                        <p className="text-sm opacity-80">{event.location.split(',')[1]}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{event.price}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>View details</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  Try different keywords or browse our featured events below.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Browse All Events
                </Link>
              </div>
            )}
          </div>
        )}

        {/* No Query State */}
        {!isLoading && !query && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600 mb-6">
              Use the search bar to find events by name, category, or location.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Browse Featured Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
