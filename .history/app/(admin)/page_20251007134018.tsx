'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizerName: string;
  organizerEmail: string;
  capacity: number;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  createdAt: string;
  rejectionReason?: string;
}

interface Transaction {
  id: string;
  eventName: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'WAITING_CONFIRMATION' | 'DONE' | 'REJECTED';
  paymentProof?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingEvents: 0,
    pendingPayments: 0,
    totalUsers: 0,
    totalEvents: 0,
    monthlyRevenue: 0
  });

  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setStats({
      pendingEvents: 12,
      pendingPayments: 8,
      totalUsers: 1250,
      totalEvents: 89,
      monthlyRevenue: 45000000
    });

    setRecentEvents([
      {
        id: '1',
        title: 'Jakarta Music Festival 2025',
        description: 'A grand music festival featuring local and international artists',
        date: '2025-11-15',
        time: '19:00',
        location: 'Gelora Bung Karno Stadium, Jakarta',
        category: 'Music',
        organizerName: 'Indonesia Music Events',
        organizerEmail: 'contact@imevents.id',
        capacity: 50000,
        price: 350000,
        status: 'PENDING',
        createdAt: '2025-10-06T10:30:00Z'
      },
      {
        id: '2',
        title: 'Tech Innovation Summit',
        description: 'Annual technology conference for startups and developers',
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
      }
    ]);

    setRecentTransactions([
      {
        id: 'TXN-001',
        eventName: 'Rock Concert 2025',
        userName: 'Ahmad Rahman',
        userEmail: 'ahmad@example.com',
        amount: 250000,
        status: 'WAITING_CONFIRMATION',
        paymentProof: 'proof_001.jpg',
        createdAt: '2025-10-07T08:30:00Z'
      },
      {
        id: 'TXN-002',
        eventName: 'Art Exhibition',
        userName: 'Siti Nurhaliza',
        userEmail: 'siti@example.com',
        amount: 75000,
        status: 'WAITING_CONFIRMATION',
        paymentProof: 'proof_002.jpg',
        createdAt: '2025-10-07T07:15:00Z'
      }
    ]);
  }, []);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      PUBLISHED: { color: 'bg-blue-100 text-blue-800', text: 'Published' },
      WAITING_CONFIRMATION: { color: 'bg-orange-100 text-orange-800', text: 'Needs Review' },
      DONE: { color: 'bg-green-100 text-green-800', text: 'Confirmed' }
    }[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage events, payments, and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Event Submissions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Event Submissions</h2>
              <a href="/admin/events" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">by {event.organizerName}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>{formatDate(event.date)} at {event.time}</span>
                      <span>{formatCurrency(event.price)}</span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {event.status === 'PENDING' && (
                      <>
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                          Reject
                        </button>
                      </>
                    )}
                    <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payment Reviews */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Payment Reviews Needed</h2>
              <a href="/admin/transactions" className="text-sm text-blue-600 hover:text-blue-800">
                View all
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{transaction.eventName}</h3>
                    <p className="text-xs text-gray-500 mt-1">by {transaction.userName} ({transaction.userEmail})</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>{formatCurrency(transaction.amount)}</span>
                      <span>{formatDate(transaction.createdAt)}</span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                      Reject
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                      View Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <a
            href="/admin/events"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Review Events</p>
              <p className="text-sm text-gray-600">Approve or reject event submissions</p>
            </div>
          </a>

          <a
            href="/admin/transactions"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Payment Reviews</p>
              <p className="text-sm text-gray-600">Verify payment proofs</p>
            </div>
          </a>

          <a
            href="/admin/users"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-600">Manage user accounts and roles</p>
            </div>
          </a>

          <a
            href="/admin/reports"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-sm text-gray-600">Analytics and insights</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
