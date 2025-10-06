'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmationDialog from '@/src/components/ConfirmationDialog';

interface OrganizerStats {
  overview: {
    totalEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
    upcomingEvents: number;
  };
  recentTransactions: any[];
  monthlyRevenue: any[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  availableSeats: number;
  maxSeats: number;
  ticketPrice: number;
  _count?: {
    transactions: number;
    reviews: number;
  };
}

interface Transaction {
  id: string;
  status: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function OrganizerDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (session?.user && activeTab === 'overview') {
      fetchStats();
    } else if (session?.user && activeTab === 'events') {
      fetchEvents();
    } else if (session?.user && activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [session, activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizer/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events?organizerId=${session?.user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events || []);
      } else {
        toast.error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizer/transactions');
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions || []);
      } else {
        toast.error(data.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, status: string) => {
    try {
      setActionLoading(transactionId);
      const response = await fetch(`/api/organizer/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Transaction ${status.toLowerCase()} successfully`);
        fetchTransactions();
      } else {
        toast.error(data.error || `Failed to ${status.toLowerCase()} transaction`);
      }
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} transaction`);
    } finally {
      setActionLoading(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setActionLoading(eventId);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setActionLoading(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };
    
    const statusConfig = config[status as keyof typeof config] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}</p>
        </div>

        {/* Stats Cards - Only show for overview */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.overview.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalTicketsSold.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.overview.upcomingEvents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('events')}
              >
                My Events
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                      <div className="space-y-3">
                        {stats.recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{transaction.event.title}</p>
                              <p className="text-xs text-gray-500">{transaction.user.name}</p>
                              <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(transaction.totalAmount)}</p>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Monthly Revenue Chart Placeholder */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Revenue chart would be displayed here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          isLoading={actionLoading !== null}
        />
      </div>
    </div>
  );
}

export default function ProtectedOrganizerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['ORGANIZER']}>
      <OrganizerDashboardPage />
    </ProtectedRoute>
  );
}
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tickets Sold</p>
                        <p className="font-medium">{event.ticketsSold} / {event.totalTickets}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-medium text-green-600">{formatCurrency(event.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rating & Reviews</p>
                        <div className="flex items-center">
                          {renderStars(Math.floor(event.rating))}
                          <span className="ml-1 text-sm font-medium">{event.rating}</span>
                          <span className="ml-1 text-sm text-gray-500">({event.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    {event.pendingTransactions > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <span className="text-yellow-800 font-medium">
                          {event.pendingTransactions} transactions pending approval
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Payment Confirmations</h2>
              
              <div className="space-y-4">
                {pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{transaction.eventName}</h3>
                        <p className="text-sm text-gray-600">Customer: {transaction.customerName}</p>
                        <p className="text-sm text-gray-600">Transaction ID: {transaction.id}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg text-gray-900">{formatCurrency(transaction.amount)}</div>
                        <div className="text-sm text-gray-500">Submitted: {transaction.submittedAt}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-red-600">
                        Expires: {transaction.expiresAt}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                          Reject
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                          View Proof
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/create-event"
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Event
                </a>
                <button className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Transactions
                </button>
                <button className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Analytics Report
                </button>
                <button className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Manage Promotions
                </button>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Ahmad Rahman</span>
                    {renderStars(5)}
                  </div>
                  <p className="text-sm text-gray-600">"Amazing concert! Great organization."</p>
                  <p className="text-xs text-gray-500 mt-1">Rock Concert 2025</p>
                </div>
                
                <div className="border-b border-gray-200 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Sari Dewi</span>
                    {renderStars(4)}
                  </div>
                  <p className="text-sm text-gray-600">"Great music, venue could be better."</p>
                  <p className="text-xs text-gray-500 mt-1">Jazz Night Premium</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Budi Santoso</span>
                    {renderStars(5)}
                  </div>
                  <p className="text-sm text-gray-600">"Exceeded expectations!"</p>
                  <p className="text-xs text-gray-500 mt-1">Classical Music Festival</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a href="/reviews" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All Reviews →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content for Events */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">My Events</h3>
              <a
                href="/create-event"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Event
              </a>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{formatCurrency(event.ticketPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Seats Available</p>
                          <p className="font-medium">{event.availableSeats} / {event.maxSeats}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${((event.maxSeats - event.availableSeats) / event.maxSeats) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Transactions</p>
                          <p className="font-medium">{event._count?.transactions || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reviews</p>
                          <p className="font-medium">{event._count?.reviews || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <a
                            href={`/events/${event.id}/attendees`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Attendees
                          </a>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Navigate to edit event
                              window.location.href = `/events/${event.id}/edit`;
                            }}
                            className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Delete Event',
                                message: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
                                type: 'danger',
                                onConfirm: () => handleDeleteEvent(event.id)
                              });
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            disabled={actionLoading === event.id}
                          >
                            {actionLoading === event.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No events found. Create your first event!</p>
                    <a
                      href="/create-event"
                      className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Event
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Content for Transactions */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Management</h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{transaction.event.title}</h4>
                          <p className="text-sm text-gray-600">Customer: {transaction.user.name} ({transaction.user.email})</p>
                          <p className="text-sm text-gray-600">Transaction ID: {transaction.id}</p>
                          <p className="text-sm text-gray-600">Date: {formatDate(transaction.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg text-gray-900">{formatCurrency(transaction.totalAmount)}</div>
                          <div className="text-sm text-gray-500">Quantity: {transaction.quantity}</div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      
                      {transaction.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2 mt-4">
                          <button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Reject Transaction',
                                message: `Are you sure you want to reject this transaction? The customer will be notified and any used points/coupons will be refunded.`,
                                type: 'danger',
                                onConfirm: () => handleTransactionAction(transaction.id, 'REJECTED')
                              });
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            disabled={actionLoading === transaction.id}
                          >
                            {actionLoading === transaction.id ? 'Processing...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Confirm Transaction',
                                message: `Are you sure you want to confirm this transaction? The customer will be notified and tickets will be issued.`,
                                type: 'info',
                                onConfirm: () => handleTransactionAction(transaction.id, 'CONFIRMED')
                              });
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            disabled={actionLoading === transaction.id}
                          >
                            {actionLoading === transaction.id ? 'Processing...' : 'Confirm'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        isLoading={actionLoading !== null}
      />
    </div>
  );
}

export default function ProtectedOrganizerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['ORGANIZER']}>
      <OrganizerDashboardPage />
    </ProtectedRoute>
  );
}
