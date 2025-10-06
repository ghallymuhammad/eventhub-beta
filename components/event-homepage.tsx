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
          return; // Exit early if API call succeeds
        }
      }
      
      // If we reach here, the API call failed or didn't return success
      console.log('API call failed, falling back to mock data');
      const mockEvents = getMockEvents();
      setAllEvents(mockEvents);
      setTotalPages(1);
      
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to mock data if API fails
      console.log('Exception occurred, falling back to mock data');
      const mockEvents = getMockEvents();
      setAllEvents(mockEvents);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data
  const getMockEvents = (): Event[] => [
    {
      id: '1',
      title: 'Rock Concert 2025: Night of Legends',
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
      category: 'Technology',
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
      title: 'Art Exhibition: Modern Indonesia',
      category: 'Arts',
      location: 'Yogyakarta',
      date: 'Oct 25, 2025',
      datetime: '2025-10-25T10:00:00',
      price: 'Rp 50.000',
      priceValue: 50000,
      image: 'from-purple-400 to-indigo-500',
      featured: false,
      organizer: 'Yogya Art Gallery'
    },
    {
      id: '4',
      title: 'Food Festival: Taste of Indonesia',
      category: 'Food',
      location: 'Surabaya',
      date: 'Nov 1, 2025',
      datetime: '2025-11-01T12:00:00',
      price: 'Rp 75.000',
      priceValue: 75000,
      image: 'from-pink-400 to-red-500',
      featured: true,
      organizer: 'Culinary Association'
    },
    {
      id: '5',
      title: 'Business Summit 2025',
      category: 'Business',
      location: 'Jakarta',
      date: 'Nov 5, 2025',
      datetime: '2025-11-05T08:00:00',
      price: 'Rp 500.000',
      priceValue: 500000,
      image: 'from-blue-400 to-purple-500',
      featured: false,
      organizer: 'Jakarta Business Center'
    },
    {
      id: '6',
      title: 'Marathon Jakarta 2025',
      category: 'Sports',
      location: 'Jakarta',
      date: 'Nov 10, 2025',
      datetime: '2025-11-10T06:00:00',
      price: 'Rp 150.000',
      priceValue: 150000,
      image: 'from-yellow-400 to-orange-500',
      featured: true,
      organizer: 'Jakarta Sports Club'
    },
    {
      id: '7',
      title: 'Theater Performance: Hamlet',
      category: 'Theater',
      location: 'Bandung',
      date: 'Nov 15, 2025',
      datetime: '2025-11-15T19:30:00',
      price: 'Rp 100.000',
      priceValue: 100000,
      image: 'from-indigo-400 to-purple-500',
      featured: false,
      organizer: 'Bandung Theater Group'
    },
    {
      id: '8',
      title: 'Photography Workshop',
      category: 'Arts',
      location: 'Yogyakarta',
      date: 'Nov 20, 2025',
      datetime: '2025-11-20T14:00:00',
      price: 'Rp 200.000',
      priceValue: 200000,
      image: 'from-purple-400 to-indigo-500',
      featured: false,
      organizer: 'Photo Society Jogja'
    }
  ];

  const categories = ['all', 'Music', 'Technology', 'Arts', 'Food', 'Business', 'Sports', 'Theater'];
  const locations = ['all', 'Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch events from API
  useEffect(() => {
    // Temporarily use mock data while database is not configured
    if (currentPage === 1) {
      setLoading(true);
      setTimeout(() => {
        console.log('Loading mock events...');
        const mockEvents = getMockEvents();
        setAllEvents(mockEvents);
        setTotalPages(1);
        setLoading(false);
      }, 500); // Simulate loading time
    } else {
      fetchEvents(); // Keep API calls for pagination if needed
    }
  }, [searchQuery, selectedCategory, currentPage]);

  // Filter and sort events
  useEffect(() => {
    let events = [...allEvents];
    
    // Filter by location
    if (selectedLocation !== 'all') {
      events = events.filter(event => 
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
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
      'Technology': '�',
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

            {/* Filter Categories */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? '🔥 All Events' : `${getCategoryIcon(category)} ${category}`}
                </button>
              ))}
            </div>

            {/* Location and Sort Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Events</h2>
            <p className="text-xl text-gray-600">Don't miss out on these amazing experiences</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  {/* Event Image with Gradient */}
                  <div className={`h-48 bg-gradient-to-br ${event.image} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                        {event.category}
                      </span>
                    </div>
                    {event.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-400 px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <Countdown targetDate={event.datetime} />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {event.organizer}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {event.price}
                        </span>
                      </div>
                      <Link 
                        href={`/events/${event.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredEvents.length > 0 && currentPage < totalPages && (
            <div className="text-center mt-12">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Load More Events
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Own Event?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of organizers and start hosting amazing events today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.isAuthenticated ? (
              <Link
                href="/create-event"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Create Event
              </Link>
            ) : (
              <Link
                href="/signin"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            )}
            {user?.isAuthenticated && (
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
