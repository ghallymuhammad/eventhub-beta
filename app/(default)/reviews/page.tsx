'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

function ReviewsPage() {
  const attendedEvents = [
    {
      id: "event-001",
      name: "Rock Concert 2025",
      date: "2025-09-15",
      organizer: "Music Events Indonesia",
      hasReviewed: true,
      myRating: 5,
      myReview: "Amazing concert! The sound quality was perfect and the energy was incredible.",
    },
    {
      id: "event-002", 
      name: "Tech Workshop: AI Fundamentals",
      date: "2025-09-20",
      organizer: "TechLearn Indonesia",
      hasReviewed: false,
      myRating: null,
      myReview: null,
    }
  ];

  const eventReviews = [
    {
      id: "rev-001",
      eventId: "event-001", 
      eventName: "Rock Concert 2025",
      userName: "Ahmad Rahman",
      rating: 5,
      review: "Best concert I've ever been to! The band was amazing and the venue was perfect.",
      date: "2025-09-16",
      verified: true,
    },
    {
      id: "rev-002",
      eventId: "event-001",
      eventName: "Rock Concert 2025", 
      userName: "Sari Dewi",
      rating: 4,
      review: "Great music and atmosphere. Only complaint was the long queue for drinks.",
      date: "2025-09-17",
      verified: true,
    },
    {
      id: "rev-003",
      eventId: "event-001",
      eventName: "Rock Concert 2025",
      userName: "Budi Santoso", 
      rating: 5,
      review: "Exceeded my expectations! Will definitely attend again next year.",
      date: "2025-09-18",
      verified: true,
    }
  ];

  const organizerProfile = {
    name: "Music Events Indonesia",
    totalEvents: 25,
    totalReviews: 156,
    averageRating: 4.6,
    ratingDistribution: {
      5: 89,
      4: 45,
      3: 15,
      2: 5,
      1: 2
    }
  };

  const renderStars = (rating: number, size: string = "w-5 h-5") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600 mt-2">Share your experience and help others discover great events</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - My Reviews & Pending */}
          <div className="lg:col-span-2">
            {/* Pending Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Events to Review</h2>
              
              {attendedEvents.filter(event => !event.hasReviewed).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">Event Date: {new Date(event.date).toLocaleDateString('id-ID')}</p>
                      <p className="text-sm text-gray-600">Organizer: {event.organizer}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Write Review
                    </button>
                  </div>
                </div>
              ))}

              {attendedEvents.filter(event => !event.hasReviewed).length === 0 && (
                <p className="text-gray-500 text-center py-8">No events to review at the moment</p>
              )}
            </div>

            {/* My Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Reviews</h2>
              
              {attendedEvents.filter(event => event.hasReviewed).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">Reviewed on: {new Date(event.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                  </div>
                  
                  <div className="mb-2">
                    {renderStars(event.myRating || 0)}
                  </div>
                  
                  <p className="text-gray-700">{event.myReview}</p>
                </div>
              ))}
            </div>

            {/* All Event Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
              
              <div className="space-y-6">
                {eventReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.eventName}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm font-medium text-gray-900 mr-2">{review.userName}</span>
                          {review.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Verified Attendee
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-sm text-gray-500 mt-1">{new Date(review.date).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Organizer Profile */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizer Profile</h2>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">ME</span>
                </div>
                <h3 className="font-semibold text-gray-900">{organizerProfile.name}</h3>
                <p className="text-sm text-gray-600">{organizerProfile.totalEvents} Events Organized</p>
              </div>

              {/* Overall Rating */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-900 mr-2">{organizerProfile.averageRating}</span>
                  {renderStars(Math.floor(organizerProfile.averageRating))}
                </div>
                <p className="text-sm text-gray-600">{organizerProfile.totalReviews} reviews</p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = organizerProfile.ratingDistribution[rating as keyof typeof organizerProfile.ratingDistribution];
                  const percentage = (count / organizerProfile.totalReviews) * 100;
                  
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-3 text-gray-600">{rating}</span>
                      <svg className="w-4 h-4 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{organizerProfile.totalEvents}</div>
                    <div className="text-xs text-gray-600">Total Events</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{Math.round((organizerProfile.ratingDistribution[5] + organizerProfile.ratingDistribution[4]) / organizerProfile.totalReviews * 100)}%</div>
                    <div className="text-xs text-gray-600">Positive Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedReviews() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <ReviewsPage />
    </ProtectedRoute>
  );
}
