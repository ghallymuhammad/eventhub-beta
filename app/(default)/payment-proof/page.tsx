'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  totalAmount: number;
  originalAmount: number;
  discountAmount: number;
  pointsUsed: number;
  status: string;
  paymentDeadline: string;
  event: {
    title: string;
    date: string;
    location: string;
  };
}

export default function PaymentProofPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get('transaction');

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  useEffect(() => {
    if (transaction?.paymentDeadline) {
      const interval = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [transaction]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${transactionId}`);
      const data = await response.json();
      
      if (data.success) {
        setTransaction(data.data);
        
        // Check if already expired
        if (new Date() > new Date(data.data.paymentDeadline)) {
          setIsExpired(true);
        }
      } else {
        toast.error(data.error || 'Transaction not found');
        router.push('/profile');
      }
    } catch (error) {
      toast.error('Failed to fetch transaction');
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!transaction?.paymentDeadline) return;

    const now = new Date().getTime();
    const deadline = new Date(transaction.paymentDeadline).getTime();
    const difference = deadline - now;

    if (difference <= 0) {
      setTimeLeft('Expired');
      setIsExpired(true);
      return;
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setPaymentProof(file);
    }
  };

  const uploadPaymentProof = async () => {
    if (!paymentProof || !transactionId) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);
      formData.append('transactionId', transactionId);

      const response = await fetch('/api/transactions/payment-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment proof uploaded successfully!');
        router.push('/profile?tab=transactions');
      } else {
        toast.error(data.error || 'Failed to upload payment proof');
      }
    } catch (error) {
      toast.error('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transaction Not Found</h1>
          <button
            onClick={() => router.push('/profile')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Upload Payment Proof</h1>
          <p className="text-gray-600 mt-2">
            Please upload your payment proof to complete the transaction
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Time Remaining</h2>
            {isExpired ? (
              <div className="text-4xl font-bold text-red-600 mb-2">EXPIRED</div>
            ) : (
              <div className="text-4xl font-bold text-blue-600 mb-2">{timeLeft}</div>
            )}
            <p className="text-gray-600">
              {isExpired 
                ? 'Payment deadline has passed. This transaction will be cancelled.'
                : 'Upload your payment proof before the deadline'
              }
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{transaction.event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(transaction.event.date).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span>{transaction.event.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Original Amount:</span>
              <span>{formatCurrency(transaction.originalAmount)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="text-green-600">-{formatCurrency(transaction.discountAmount)}</span>
              </div>
            )}
            {transaction.pointsUsed > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Points Used:</span>
                <span className="text-blue-600">{transaction.pointsUsed} points</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="font-semibold text-lg">{formatCurrency(transaction.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Bank Transfer</h3>
              <div className="text-sm text-blue-800">
                <p><strong>Bank:</strong> Bank Central Asia (BCA)</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>Account Name:</strong> EventHub Indonesia</p>
                <p><strong>Amount:</strong> {formatCurrency(transaction.totalAmount)}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please transfer the exact amount and upload a clear screenshot 
                or photo of your transfer receipt.
              </p>
            </div>
          </div>
        </div>

        {/* File Upload */}
        {!isExpired && transaction.status === 'WAITING_PAYMENT' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Payment Proof</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {paymentProof && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Selected file: <strong>{paymentProof.name}</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <button
                onClick={uploadPaymentProof}
                disabled={!paymentProof || uploading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload Payment Proof'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {transaction.status !== 'WAITING_PAYMENT' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              {transaction.status === 'WAITING_CONFIRMATION' && (
                <div className="text-yellow-600">
                  <h3 className="font-semibold mb-2">Payment Proof Uploaded</h3>
                  <p>Your payment proof has been uploaded. Please wait for organizer confirmation.</p>
                </div>
              )}
              {transaction.status === 'DONE' && (
                <div className="text-green-600">
                  <h3 className="font-semibold mb-2">Transaction Completed</h3>
                  <p>Your transaction has been confirmed. Enjoy your event!</p>
                </div>
              )}
              {transaction.status === 'REJECTED' && (
                <div className="text-red-600">
                  <h3 className="font-semibold mb-2">Transaction Rejected</h3>
                  <p>Your transaction has been rejected. Please contact support if you believe this is an error.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
