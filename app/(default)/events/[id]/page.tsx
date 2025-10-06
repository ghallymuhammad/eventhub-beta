'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  capacity: number;
  price?: number;
  organizer: {
    id: string;
    name: string;
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    quantity: number;
    sold: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    user: {
      name: string;
    };
    createdAt: string;
  }>;
  _count?: {
    reviews: number;
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  // Get user from localStorage (similar to other components)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchEventDetails();
    }
  }, [params.id]);

  useEffect(() => {
    if (event?.reviews && event.reviews.length > 0) {
      const totalRating = event.reviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(totalRating / event.reviews.length);
    }
  }, [event?.reviews]);

  // Mock event data for fallback
  const getMockEventById = (id: string): Event => {
    const mockEvents: { [key: string]: Event } = {
      '1': {
        id: '1',
        title: 'Rock Concert 2025: Night of Legends',
        description: 'An epic night of rock music featuring legendary bands and emerging artists.',
        fullDescription: 'Join us for an unforgettable night of rock music! This concert features some of the most legendary rock bands alongside exciting new artists. Experience powerful performances, amazing stage effects, and a crowd that shares your passion for rock music.\n\nThe event includes:\n- 3 hours of non-stop music\n- Multiple bands and solo artists\n- Professional sound and lighting\n- Food and beverage available\n- Merchandise stands\n- Meet & greet opportunities',
        date: '2025-10-15',
        time: '19:00',
        location: 'Jakarta Convention Center, Jakarta',
        category: 'Music',
        image: 'rock-concert.jpg',
        capacity: 5000,
        price: 250000,
        organizer: {
          id: 'org1',
          name: 'Jakarta Music Hall'
        },
        ticketTypes: [
          {
            id: 'ticket1',
            name: 'General Admission',
            price: 250000,
            description: 'Standing area, great view of the stage',
            quantity: 3000,
            sold: 1500
          },
          {
            id: 'ticket2',
            name: 'VIP Section',
            price: 500000,
            description: 'Premium seating with exclusive perks',
            quantity: 500,
            sold: 200
          }
        ],
        reviews: [
          {
            id: 'review1',
            rating: 5,
            comment: 'Amazing event! The organizer always delivers top-quality concerts.',
            user: { name: 'Sarah M.' },
            createdAt: '2025-09-15T10:30:00Z'
          },
          {
            id: 'review2',
            rating: 4,
            comment: 'Great venue and sound quality. Looking forward to this event!',
            user: { name: 'Mike K.' },
            createdAt: '2025-09-20T14:22:00Z'
          }
        ],
        _count: { reviews: 2 }
      },
      '2': {
        id: '2',
        title: 'Tech Workshop: AI Fundamentals',
        description: 'Learn the basics of Artificial Intelligence and Machine Learning in this hands-on workshop.',
        fullDescription: 'Dive into the world of Artificial Intelligence with our comprehensive workshop designed for beginners and intermediate learners.\n\nWhat you\'ll learn:\n- AI and ML fundamentals\n- Python programming for AI\n- Popular AI frameworks\n- Hands-on projects\n- Real-world applications\n- Career opportunities in AI\n\nThis workshop is perfect for students, professionals, and anyone curious about AI technology.',
        date: '2025-10-20',
        time: '09:00',
        location: 'TechHub Bandung, Bandung',
        category: 'Technology',
        image: 'tech-workshop.jpg',
        capacity: 100,
        price: 0,
        organizer: {
          id: 'org2',
          name: 'TechHub Bandung'
        },
        ticketTypes: [
          {
            id: 'ticket3',
            name: 'Free Admission',
            price: 0,
            description: 'Includes workshop materials and lunch',
            quantity: 100,
            sold: 75
          }
        ],
        reviews: [
          {
            id: 'review3',
            rating: 5,
            comment: 'Excellent workshop! Very informative and well-structured.',
            user: { name: 'Alex R.' },
            createdAt: '2025-09-25T09:15:00Z'
          }
        ],
        _count: { reviews: 1 }
      },
      '3': {
        id: '3',
        title: 'Art Exhibition: Modern Indonesia',
        description: 'Contemporary art exhibition showcasing the works of Indonesian artists.',
        fullDescription: 'Experience the vibrant world of contemporary Indonesian art in this exclusive exhibition featuring works from both established and emerging artists.\n\nHighlights:\n- 50+ artworks from 20 artists\n- Interactive installations\n- Artist talks and workshops\n- Cultural performances\n- Art marketplace\n- Guided tours available\n\nThis exhibition celebrates the diversity and creativity of Indonesian contemporary art scene.',
        date: '2025-10-25',
        time: '10:00',
        location: 'Yogya Art Gallery, Yogyakarta',
        category: 'Arts',
        image: 'art-exhibition.jpg',
        capacity: 200,
        price: 50000,
        organizer: {
          id: 'org3',
          name: 'Yogya Art Gallery'
        },
        ticketTypes: [
          {
            id: 'ticket4',
            name: 'Regular Entry',
            price: 50000,
            description: 'Access to all exhibition areas',
            quantity: 150,
            sold: 80
          },
          {
            id: 'ticket5',
            name: 'Premium Package',
            price: 100000,
            description: 'Includes guided tour and artist meet & greet',
            quantity: 50,
            sold: 25
          }
        ],
        reviews: [],
        _count: { reviews: 0 }
      }
    };

    return mockEvents[id] || {
      id,
      title: 'Event Not Found',
      description: 'This event could not be found.',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      location: 'Unknown',
      category: 'Other',
      capacity: 0,
      organizer: { id: 'unknown', name: 'Unknown Organizer' },
      ticketTypes: [],
      reviews: [],
      _count: { reviews: 0 }
    };
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      const response = await fetch(`/api/events/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvent(data.data);
          return;
        }
      }
      
      // Fallback to mock data if API fails
      console.log('API failed, using mock event data for ID:', params.id);
      const mockEvent = getMockEventById(params.id as string);
      setEvent(mockEvent);
      
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      // Use mock data as fallback
      const mockEvent = getMockEventById(params.id as string);
      setEvent(mockEvent);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {event.image && (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {event.category}
                  </span>
                  {averageRating > 0 && (
                    <div className="flex items-center">
                      {renderStars(Math.round(averageRating))}
                      <span className="ml-2">
                        {averageRating.toFixed(1)} ({event._count?.reviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {!isEventPassed && (
                <Link
                  href={`/checkout?event=${event.id}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Tickets
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)} at {event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Capacity: {event.capacity} people</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Organized by {event.organizer.name}</span>
                  </div>
                </div>
              </div>

              {event.ticketTypes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ticket Types</h3>
                  <div className="space-y-2">
                    {event.ticketTypes.map((ticketType) => (
                      <div key={ticketType.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{ticketType.name}</h4>
                            {ticketType.description && (
                              <p className="text-sm text-gray-600">{ticketType.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(ticketType.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ticketType.quantity - ticketType.sold} left
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {event.fullDescription || event.description}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reviews ({event.reviews.length})
          </h2>
          
          {event.reviews.length > 0 ? (
            <div className="space-y-4">
              {event.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{review.user.name}</span>
                      <div className="ml-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this event!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
