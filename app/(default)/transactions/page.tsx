'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

function TransactionsPage() {
  const transactions = [
    {
      id: "TXN-001",
      eventName: "Rock Concert 2025",
      date: "2025-10-15",
      amount: 250000,
      pointsUsed: 20000,
      finalAmount: 230000,
      status: "done",
      paymentProof: "proof_001.jpg",
      createdAt: "2025-09-25 14:30",
      expiresAt: null,
    },
    {
      id: "TXN-002", 
      eventName: "Tech Workshop",
      date: "2025-10-20",
      amount: 0,
      pointsUsed: 0,
      finalAmount: 0,
      status: "waiting_payment",
      paymentProof: null,
      createdAt: "2025-09-30 10:15",
      expiresAt: "2025-09-30 12:15",
    },
    {
      id: "TXN-003",
      eventName: "Art Exhibition", 
      date: "2025-11-05",
      amount: 75000,
      pointsUsed: 5000,
      finalAmount: 70000,
      status: "waiting_admin",
      paymentProof: "proof_003.jpg",
      createdAt: "2025-09-29 16:45",
      expiresAt: null,
    },
    {
      id: "TXN-004",
      eventName: "Music Festival",
      date: "2025-12-15",
      amount: 300000,
      pointsUsed: 0,
      finalAmount: 300000,
      status: "expired",
      paymentProof: null,
      createdAt: "2025-09-28 09:20",
      expiresAt: "2025-09-28 11:20",
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting_payment: { color: 'bg-yellow-100 text-yellow-800', text: 'Waiting Payment' },
      waiting_admin: { color: 'bg-blue-100 text-blue-800', text: 'Waiting Confirmation' },
      done: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'Expired' },
      canceled: { color: 'bg-orange-100 text-orange-800', text: 'Canceled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-gray-600 mt-2">Track all your event ticket purchases and their status</p>
        </div>

        {/* Transactions Grid */}
        <div className="grid gap-6">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.eventName}
                      </h3>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Transaction ID</p>
                        <p className="font-medium">{transaction.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Event Date</p>
                        <p className="font-medium">{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Original Price</p>
                        <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Points Used</p>
                        <p className="font-medium text-blue-600">
                          {transaction.pointsUsed > 0 ? `-${formatCurrency(transaction.pointsUsed)}` : 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Final Amount</p>
                        <p className="font-bold text-lg text-green-600">{formatCurrency(transaction.finalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created At</p>
                        <p className="font-medium">{transaction.createdAt}</p>
                      </div>
                    </div>

                    {/* Payment Timer for waiting_payment status */}
                    {transaction.status === 'waiting_payment' && transaction.expiresAt && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-yellow-800 font-medium">
                            {getTimeRemaining(transaction.expiresAt)}
                          </span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Upload payment proof before the timer expires
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {transaction.status === 'waiting_payment' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Upload Payment Proof
                    </button>
                  )}
                  
                  {transaction.status === 'done' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Download Ticket
                    </button>
                  )}

                  {(transaction.status === 'waiting_payment' || transaction.status === 'waiting_admin') && (
                    <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                      Cancel Transaction
                    </button>
                  )}

                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Status Legend */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status Guide</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">
                Waiting Payment
              </span>
              <span className="text-gray-600">Upload payment proof within 2 hours</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                Waiting Confirmation
              </span>
              <span className="text-gray-600">Admin reviewing payment proof</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                Completed
              </span>
              <span className="text-gray-600">Payment confirmed, ticket issued</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                Rejected
              </span>
              <span className="text-gray-600">Payment rejected by admin</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3">
                Expired
              </span>
              <span className="text-gray-600">No payment proof uploaded in time</span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">
                Canceled
              </span>
              <span className="text-gray-600">Transaction canceled by user/system</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedTransactions() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <TransactionsPage />
    </ProtectedRoute>
  );
}
