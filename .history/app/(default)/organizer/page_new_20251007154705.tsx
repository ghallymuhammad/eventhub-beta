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
            {/* Overview Tab */}
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

            {/* Events Tab Content */}
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
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-gray-600">Available Seats</p>
                              <p className="font-medium">{event.availableSeats} / {event.maxSeats}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Ticket Price</p>
                              <p className="font-medium text-green-600">{formatCurrency(event.ticketPrice)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Transactions</p>
                              <p className="font-medium">{event._count?.transactions || 0}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
                        <a
                          href="/create-event"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Your First Event
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab Content */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{transaction.id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.event.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(transaction.totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(transaction.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(transaction.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {transaction.status === 'PENDING' && (
                                  <>
                                    <button
                                      className="text-green-600 hover:text-green-700 mr-3"
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Confirm Transaction',
                                          message: `Are you sure you want to approve this transaction?`,
                                          type: 'info',
                                          onConfirm: () => handleTransactionAction(transaction.id, 'CONFIRMED')
                                        });
                                      }}
                                      disabled={actionLoading === transaction.id}
                                    >
                                      {actionLoading === transaction.id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Reject Transaction',
                                          message: `Are you sure you want to reject this transaction?`,
                                          type: 'danger',
                                          onConfirm: () => handleTransactionAction(transaction.id, 'REJECTED')
                                        });
                                      }}
                                      disabled={actionLoading === transaction.id}
                                    >
                                      {actionLoading === transaction.id ? 'Processing...' : 'Reject'}
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
