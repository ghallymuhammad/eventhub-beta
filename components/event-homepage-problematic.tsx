'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import Countdown from "./Countdown";

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

interface Event {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  datetime: string; // Full datetime for countdown
  price: string;
  priceValue: number;
  image: string;
  featured: boolean;
  organizer: string;
}

function EventHomepage() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventsPerPage = 12;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('page', currentPage.toString());
      params.append('limit', eventsPerPage.toString());

      const response = await fetch(`/api/events?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API data to match component interface
          const transformedEvents = data.data.events.map((event: any) => ({
            id: event.id,
            title: event.title,
            category: event.category,
            location: event.location,
            date: new Date(event.date).toLocaleDateString(),
            datetime: event.date,
            price: formatIDR(event.ticketTypes?.[0]?.price || 0),
            priceValue: event.ticketTypes?.[0]?.price || 0,
            image: getCategoryGradient(event.category),
            featured: false, // Could be determined by some criteria
            organizer: event.organizer.name
          }));
          
          if (currentPage === 1) {
            setAllEvents(transformedEvents);
          } else {
            // Append to existing events for load more
            setAllEvents(prev => [...prev, ...transformedEvents]);
          }
          setTotalPages(data.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to mock data if API fails
      setAllEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedCategory, currentPage]);

  // Format price in IDR
  const formatIDR = (amount: number) => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get gradient for category
  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'Music': 'from-red-400 to-pink-500',
      'Technology': 'from-green-400 to-blue-500',
      'Arts': 'from-purple-400 to-indigo-500',
      'Sports': 'from-yellow-400 to-orange-500',
      'Food': 'from-pink-400 to-red-500',
      'Business': 'from-blue-400 to-purple-500',
      'Theater': 'from-indigo-400 to-purple-500'
    };
    return gradients[category] || 'from-gray-400 to-gray-500';
  };

  // Fallback mock data
  const getMockEvents = (): Event[] => [
    {
      id: '1',
      title: 'Rock Concert 2025',
      category: 'Music',
      location: 'Jakarta',
      date: 'Oct 15, 2025',
      datetime: '2025-10-15T19:00:00',
      price: 'Rp 250.000',
      priceValue: 250000,
      image: 'from-red-400 to-pink-500',
      featured: true,
      organizer: 'Jakarta Music Hall'
    },
    {
      id: '2',
      title: 'Tech Workshop: AI Fundamentals',
      category: 'Workshop',
      location: 'Bandung',
      date: 'Oct 20, 2025',
      datetime: '2025-10-20T09:00:00',
      price: 'FREE',
      priceValue: 0,
      image: 'from-green-400 to-blue-500',
      featured: true,
      organizer: 'TechHub Bandung'
    },
    {
      id: '3',
      title: 'Modern Art Exhibition',
      category: 'Arts',
      location: 'Yogyakarta',
      date: 'Nov 5, 2025',
      datetime: '2025-11-05T10:00:00',
      price: 'Rp 75.000',
      priceValue: 75000,
      image: 'from-purple-400 to-indigo-500',
      featured: true,
      organizer: 'Yogya Art Gallery'
    },
    {
      id: '4',
      title: 'Food Festival 2025',
      category: 'Food',
      location: 'Jakarta',
      date: 'Nov 10, 2025',
      datetime: '2025-11-10T11:00:00',
      price: 'Rp 150.000',
      priceValue: 150000,
      image: 'from-yellow-400 to-orange-500',
      featured: false,
      organizer: 'Jakarta Food Society'
    },
    {
      id: '5',
      title: 'Business Summit',
      category: 'Business',
      location: 'Surabaya',
      date: 'Nov 15, 2025',
      datetime: '2025-11-15T08:00:00',
      price: 'Rp 500.000',
      priceValue: 500000,
      image: 'from-blue-400 to-cyan-500',
      featured: false,
      organizer: 'Business Leaders Indonesia'
    },
    {
      id: '6',
      title: 'Football Championship',
      category: 'Sports',
      location: 'Bandung',
      date: 'Nov 20, 2025',
      datetime: '2025-11-20T15:00:00',
      price: 'Rp 100.000',
      priceValue: 100000,
      image: 'from-green-400 to-teal-500',
      featured: false,
      organizer: 'Bandung Sports Arena'
    },
    {
      id: '7',
      title: 'Jazz Night',
      category: 'Music',
      location: 'Surabaya',
      date: 'Dec 1, 2025',
      datetime: '2025-12-01T20:00:00',
      price: 'Rp 200.000',
      priceValue: 200000,
      image: 'from-indigo-400 to-purple-500',
      featured: false,
      organizer: 'Surabaya Jazz Club'
    },
    {
      id: '8',
      title: 'Theater Performance',
      category: 'Theater',
      location: 'Jakarta',
      date: 'Dec 5, 2025',
      datetime: '2025-12-05T19:30:00',
      price: 'Rp 125.000',
      priceValue: 125000,
      image: 'from-pink-400 to-rose-500',
      featured: false,
      organizer: 'Jakarta Theater House'
    }
  ];

  const categories = ['all', 'Music', 'Workshop', 'Arts', 'Food', 'Business', 'Sports', 'Theater'];
  const locations = ['all', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    let events = [...allEvents];

    // Filter by location (local filter since API doesn't support location yet)
    if (selectedLocation !== 'all') {
      events = events.filter(event => event.location.includes(selectedLocation));
    }

    // Sort events
    events.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceValue - b.priceValue;
        case 'price-high':
          return b.priceValue - a.priceValue;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      }
    });

    setFilteredEvents(events);
  }, [allEvents, selectedLocation, sortBy]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Music': '🎵',
      'Workshop': '💼',
      'Arts': '🎨',
      'Food': '🍕',
      'Business': '💼',
      'Sports': '⚽',
      'Theater': '🎭'
    };
    return icons[category] || '📅';
  };

  return (
    <>
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="animated-bg"></div>
          <div className="floating-particles">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="particle" style={{ 
                animationDelay: `${i * 1.5}s`,
                left: `${(i * 7) % 100}%`
              }}></div>
            ))}
          </div>
          <div className="floating-shapes">
            <div className="shape shape-circle" style={{width: '40px', height: '40px', top: '10%', left: '5%', animationDelay: '0s'}}></div>
            <div className="shape shape-square" style={{width: '30px', height: '30px', top: '20%', left: '90%', animationDelay: '2s'}}></div>
            <div className="shape shape-circle" style={{width: '25px', height: '25px', top: '80%', left: '10%', animationDelay: '4s'}}></div>
            <div className="shape shape-triangle" style={{top: '70%', left: '85%', animationDelay: '6s'}}></div>
            <div className="shape shape-circle" style={{width: '35px', height: '35px', top: '60%', left: '95%', animationDelay: '8s'}}></div>
            <div className="shape shape-square" style={{width: '20px', height: '20px', top: '30%', left: '3%', animationDelay: '10s'}}></div>
          </div>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
              Discover Amazing
              <span className="text-yellow-300 block">Events Near You</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
              From concerts and workshops to exhibitions and festivals - find and book events that match your interests.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8 max-w-6xl mx-auto glow-effect">
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search events, categories, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter and Sort Options */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-1 drop-shadow-lg">10K+</div>
              <div className="text-white/90 font-medium">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-300 mb-1 drop-shadow-lg">50K+</div>
              <div className="text-white/90 font-medium">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-1 drop-shadow-lg">100+</div>
              <div className="text-white/90 font-medium">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-300 mb-1 drop-shadow-lg">5K+</div>
              <div className="text-white/90 font-medium">Organizers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Events' : `${selectedCategory} Events`}
                {selectedLocation !== 'all' && ` in ${selectedLocation}`}
              </h2>
              <p className="text-gray-600 mt-2">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-3">
              {!user ? (
                <Link
                  href="/signin"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In to Book
                </Link>
              ) : user.role === 'organizer' ? (
                <Link
                  href="/create-event"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Event
                </Link>
              ) : null}
            </div>
          </div>

          {/* Loading State */}
          {loading && filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : (
          
          /* Events Grid */
          filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all events</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setCurrentPage(1);
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Event Image */}
                  <div className={`aspect-video bg-gradient-to-br ${event.image} relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <span>{getCategoryIcon(event.category)}</span>
                        {event.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
                      {event.featured && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                          FEATURED
                        </span>
                      )}
                      <Countdown targetDate={event.datetime} />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-bold mb-1 line-clamp-2">{event.title}</h3>
                      <p className="text-sm opacity-90 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className={`font-bold text-lg ${event.priceValue === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {event.price}
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      by {event.organizer}
                    </div>

                    {/* Action Button */}
                    {!user ? (
                      <Link
                        href="/signin"
                        className="block w-full bg-gray-400 text-white py-3 rounded-lg font-semibold text-center hover:bg-gray-500 transition-colors"
                      >
                        Sign In to Book
                      </Link>
                    ) : user.role === 'user' ? (
                      <Link
                        href={`/checkout?event=${event.id}`}
                        className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
                      >
                        {event.priceValue === 0 ? 'Register Now' : 'Get Tickets'}
                      </Link>
                    ) : (
                      <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
                        Organizer View Only
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          )}

          {/* Load More */}
          {filteredEvents.length > 0 && currentPage < totalPages && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={loading}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : `Load More Events (${currentPage}/${totalPages})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find events that match your interests</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {categories.filter(cat => cat !== 'all').map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`text-center p-6 rounded-xl transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  selectedCategory === category ? 'bg-blue-200' : 'bg-gray-100'
                }`}>
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Own Event?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of event organizers who trust our platform to manage their events seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  href="/signin"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="#events"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Browse Events
                </Link>
              </>
            ) : user.role === 'organizer' ? (
              <Link
                href="/create-event"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Create Your Event
              </Link>
            ) : (
              <Link
                href="/transactions"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                View My Tickets
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default EventHomepage;
