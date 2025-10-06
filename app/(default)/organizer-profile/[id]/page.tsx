'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface OrganizerProfile {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalEvents: number;
  totalAttendees: number;
  averageRating: number;
  totalReviews: number;
  events: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    attendees: number;
    rating: number;
    reviews: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    eventTitle: string;
    userName: string;
    date: string;
  }>;
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchOrganizerProfile();
  }, [params.id]);

  const fetchOrganizerProfile = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from /api/organizers/[id]
      // For now, we'll use mock data
      const mockProfile: OrganizerProfile = {
        id: params.id as string,
        name: 'Music Events Indonesia',
        email: 'contact@musiceventsindonesia.com',
        joinDate: '2023-01-15',
        totalEvents: 25,
        totalAttendees: 15000,
        averageRating: 4.7,
        totalReviews: 234,
        events: [
          {
            id: '1',
            title: 'Rock Concert 2025',
            date: '2025-10-15',
            location: 'Jakarta Convention Center',
            category: 'Music',
            attendees: 2500,
            rating: 4.8,
            reviews: 45
          },
          {
            id: '2', 
            title: 'Jazz Night Festival',
            date: '2025-09-20',
            location: 'Bandung Concert Hall',
            category: 'Music',
            attendees: 1200,
            rating: 4.6,
            reviews: 28
          },
          {
            id: '3',
            title: 'Classical Music Gala',
            date: '2025-08-10',
            location: 'Jakarta Symphony Hall',
            category: 'Music', 
            attendees: 800,
            rating: 4.9,
            reviews: 35
          }
        ],
        reviews: [
          {
            id: '1',
            rating: 5,
            comment: 'Absolutely incredible event! The organization was flawless and the sound quality was perfect. Will definitely attend more events by this organizer.',
            eventTitle: 'Rock Concert 2025',
            userName: 'Ahmad Rahman',
            date: '2025-09-16'
          },
          {
            id: '2',
            rating: 4,
            comment: 'Great event overall. The venue was perfect and the lineup was amazing. Only minor issue was the long queue for refreshments.',
            eventTitle: 'Jazz Night Festival', 
            userName: 'Sari Dewi',
            date: '2025-09-21'
          },
          {
            id: '3',
            rating: 5,
            comment: 'Outstanding classical music performance. The acoustics were perfect and the artists were world-class. Highly recommended!',
            eventTitle: 'Classical Music Gala',
            userName: 'Budi Santoso',
            date: '2025-08-11'
          }
        ]
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to fetch organizer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Organizer Not Found</h1>
          <Link href="/events" className="text-blue-600 hover:text-blue-700">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-6 py-6 -mt-16 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-2xl font-bold text-gray-700">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500">
                    Organizer since {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.totalEvents}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Attendees</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-2xl font-bold text-yellow-600 mr-1">{profile.averageRating}</span>
                  <div className="flex">
                    {renderStars(profile.averageRating)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.totalReviews}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Events ({profile.events.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({profile.reviews.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Events by {profile.name}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span>{event.attendees} attendees</span>
                          <div className="flex items-center">
                            <div className="flex mr-1">
                              {renderStars(event.rating)}
                            </div>
                            <span>({event.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reviews for {profile.name}
                </h2>
                <div className="space-y-6">
                  {profile.reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="flex mr-2">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-semibold text-gray-900">{review.userName}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            For: <span className="font-medium">{review.eventTitle}</span>
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
