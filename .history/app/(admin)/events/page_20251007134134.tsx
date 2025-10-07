'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizerName: string;
  organizerEmail: string;
  capacity: number;
  price: number;
  image?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  createdAt: string;
  rejectionReason?: string;
}

export default function EventApprovals() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setEvents([
      {
        id: '1',
        title: 'Jakarta Music Festival 2025',
        description: 'A grand music festival featuring local and international artists',
        fullDescription: `Join us for the biggest music festival in Jakarta! This year's lineup includes top Indonesian artists like Raisa, Tulus, and international acts. The festival will feature multiple stages, food courts with local and international cuisine, art installations, and much more.

        Event Features:
        - 3 stages with different music genres
        - 50+ artists performing
        - Food and beverage vendors
        - Art and craft exhibitions
        - Family-friendly activities
        
        Safety Measures:
        - Security checkpoints at all entrances
        - Medical teams on standby
        - Emergency evacuation plans
        - COVID-19 health protocols`,
        date: '2025-11-15',
        time: '19:00',
        location: 'Gelora Bung Karno Stadium, Jakarta',
        category: 'Music',
        organizerName: 'Indonesia Music Events',
        organizerEmail: 'contact@imevents.id',
        capacity: 50000,
        price: 350000,
        status: 'PENDING',
        createdAt: '2025-10-06T10:30:00Z',
        image: '/images/music-festival.jpg'
      },
      {
        id: '2',
        title: 'Tech Innovation Summit',
        description: 'Annual technology conference for startups and developers',
        fullDescription: `Connect with Indonesia's brightest tech minds at this exclusive summit. Learn about the latest trends in AI, blockchain, fintech, and startup ecosystem development.
        
        Agenda:
        - Keynote speakers from major tech companies
        - Panel discussions on emerging technologies
        - Networking sessions
        - Startup pitch competitions
        - Workshops on practical skills
        
        Speakers include CEOs from Gojek, Tokopedia, and international tech leaders.`,
        date: '2025-11-20',
        time: '09:00',
        location: 'Pullman Central Park, Jakarta',
        category: 'Technology',
        organizerName: 'Tech Community Jakarta',
        organizerEmail: 'admin@techjakarta.org',
        capacity: 500,
        price: 150000,
        status: 'PENDING',
        createdAt: '2025-10-05T15:45:00Z'
      },
      {
        id: '3',
        title: 'Culinary Workshop Series',
        description: 'Learn traditional Indonesian cooking from master chefs',
        fullDescription: `Master the art of Indonesian cuisine with renowned chefs. This hands-on workshop covers traditional recipes, modern techniques, and presentation skills.
        
        What You'll Learn:
        - Traditional recipes from different regions
        - Modern cooking techniques
        - Food presentation and plating
        - Ingredient selection and preparation
        
        Each participant will cook and enjoy their own meal!`,
        date: '2025-11-25',
        time: '14:00',
        location: 'Le Cordon Bleu Jakarta',
        category: 'Workshop',
        organizerName: 'Culinary Masters Indonesia',
        organizerEmail: 'info@culinarymaster.id',
        capacity: 30,
        price: 200000,
        status: 'APPROVED',
        createdAt: '2025-10-04T09:15:00Z'
      },
      {
        id: '4',
        title: 'Underground Rave Party',
        description: 'Electronic music event in abandoned warehouse',
        fullDescription: 'Late night electronic music party with international DJs.',
        date: '2025-10-30',
        time: '23:00',
        location: 'Abandoned Warehouse, North Jakarta',
        category: 'Music',
        organizerName: 'Night Events Co',
        organizerEmail: 'party@nightevents.com',
        capacity: 200,
        price: 100000,
        status: 'REJECTED',
        createdAt: '2025-10-03T20:00:00Z',
        rejectionReason: 'Venue does not meet safety standards and lacks proper permits for large gatherings.'
      }
    ]);
  }, []);

  const filteredEvents = events.filter(event => 
    filter === 'ALL' || event.status === filter
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      PUBLISHED: { color: 'bg-blue-100 text-blue-800', text: 'Published' }
    }[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };

  const handleApprove = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, status: 'APPROVED' as const }
        : event
    ));
    setShowDetails(false);
  };

  const handleReject = (eventId: string, reason: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, status: 'REJECTED' as const, rejectionReason: reason }
        : event
    ));
    setShowRejectModal(false);
    setShowDetails(false);
    setRejectionReason('');
  };

  const openRejectModal = (event: Event) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve event submissions from organizers</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === status
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
              {status !== 'ALL' && (
                <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                  {events.filter(e => e.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  
                  <p className="text-gray-600 mt-2">{event.description}</p>
                  
                  <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)} at {event.time}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {event.organizerName}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                      </svg>
                      {formatCurrency(event.price)} • {event.capacity} capacity
                    </div>
                  </div>

                  {event.status === 'REJECTED' && event.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {event.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetails(true);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                  
                  {event.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(event)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No events found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {showDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <p className="text-gray-600 mt-1">by {selectedEvent.organizerName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(selectedEvent.status)}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.category}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedEvent.date)} at {selectedEvent.time}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.location}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.capacity.toLocaleString()} people</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ticket Price</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedEvent.price)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.organizerName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.organizerEmail}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedEvent.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Description</h3>
                <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-line">
                  {selectedEvent.fullDescription}
                </div>
              </div>

              {selectedEvent.status === 'REJECTED' && selectedEvent.rejectionReason && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{selectedEvent.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedEvent.status === 'PENDING' && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => openRejectModal(selectedEvent)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Event
                </button>
                <button
                  onClick={() => handleApprove(selectedEvent.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Event</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedEvent.title}". This will be sent to the organizer.
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                required
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      handleReject(selectedEvent.id, rejectionReason.trim());
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
