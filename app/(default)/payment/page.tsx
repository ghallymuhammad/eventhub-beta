'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentData {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  tickets: TicketType[];
  subtotal: number;
  discount: number;
  total: number;
  voucherCode?: string;
  paymentDeadline?: string;
  pointsUsed?: number;
  couponId?: string;
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<'instructions' | 'upload' | 'confirmation'>('instructions');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Bank account details
  const bankDetails = {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountName: 'EventHub Indonesia',
    swiftCode: 'CENAIDJA'
  };

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data));
        setPaymentData(parsedData);
        
        // Calculate initial time remaining
        if (parsedData.paymentDeadline) {
          const deadlineTime = new Date(parsedData.paymentDeadline).getTime();
          const currentTime = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((deadlineTime - currentTime) / 1000));
          setTimeRemaining(remainingSeconds);
        } else {
          // Fallback: 2 hours from now
          setTimeRemaining(2 * 60 * 60);
        }
      } catch (error) {
        console.error('Error parsing payment data:', error);
        router.push('/');
      }
    } else {
      // Fallback to localStorage or redirect
      const storedData = localStorage.getItem('pendingPayment');
      if (storedData) {
        const parsedStoredData = JSON.parse(storedData);
        setPaymentData(parsedStoredData);
        
        // Calculate initial time remaining
        if (parsedStoredData.paymentDeadline) {
          const deadlineTime = new Date(parsedStoredData.paymentDeadline).getTime();
          const currentTime = Date.now();
          const remainingSeconds = Math.max(0, Math.floor((deadlineTime - currentTime) / 1000));
          setTimeRemaining(remainingSeconds);
        } else {
          // Fallback: 2 hours from now
          setTimeRemaining(2 * 60 * 60);
        }
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert('Please upload only JPG, JPEG, or PNG files');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setProofOfPayment(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProofOfPayment(null);
    setPreviewUrl('');
  };

  const handleSubmitPayment = async () => {
    if (!proofOfPayment || !paymentData) {
      alert('Please upload proof of payment');
      return;
    }

    setUploading(true);

    try {
      // 1. First create the transaction in the database
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: paymentData.eventId,
          tickets: paymentData.tickets,
          totalAmount: paymentData.total,
          originalAmount: paymentData.subtotal,
          pointsUsed: paymentData.pointsUsed || 0,
          couponId: paymentData.couponId
        })
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const { data: { transaction } } = await transactionResponse.json();

      // 2. Upload payment proof
      const formData = new FormData();
      formData.append('paymentProof', proofOfPayment);
      formData.append('transactionId', transaction.id);

      const uploadResponse = await fetch('/api/transactions/payment-proof', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload payment proof');
      }

      // Clear pending payment
      localStorage.removeItem('pendingPayment');

      // 3. Redirect to payment-proof tracking page
      router.push(`/payment-proof?transaction=${transaction.id}`);
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert(`Error submitting payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. We have received your proof of payment and will verify it within 24 hours.
              You will receive a confirmation email once your payment is approved.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/transactions')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Transactions
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checkout
          </button>

          {/* Payment Timer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-red-800">⏰ Payment Deadline</h2>
                <p className="text-red-700">Upload payment proof within the time limit</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeRemaining <= 300 ? 'text-red-600' : timeRemaining <= 1800 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-red-600">Time Remaining</div>
              </div>
            </div>
            {timeRemaining <= 0 && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-red-800 font-semibold">⚠️ Payment time has expired!</p>
                <p className="text-red-700 text-sm">Please return to checkout to book tickets again.</p>
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Follow the instructions below to complete your ticket purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'instructions' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Instructions</h2>
                
                {/* Step 1 */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Transfer to Bank Account</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono">{bankDetails.bankName}</span>
                            <button
                              onClick={() => copyToClipboard(bankDetails.bankName)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Number</label>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono">{bankDetails.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(bankDetails.accountNumber)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Name</label>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono">{bankDetails.accountName}</span>
                            <button
                              onClick={() => copyToClipboard(bankDetails.accountName)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono font-bold text-lg text-green-600">
                              Rp {paymentData.total.toLocaleString()}
                            </span>
                            <button
                              onClick={() => copyToClipboard(paymentData.total.toString())}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Please transfer the exact amount to the account above. Include your name in the transfer description.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Proof of Payment</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      After making the transfer, click the button below to upload your payment receipt or screenshot.
                    </p>
                    <button
                      onClick={() => setStep('upload')}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      I've Made the Payment - Upload Proof
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Proof of Payment</h2>
                  <button
                    onClick={() => setStep('instructions')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {proofOfPayment ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={previewUrl}
                            alt="Proof of payment preview"
                            className="max-w-full max-h-64 rounded-lg shadow-md"
                          />
                          <button
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{proofOfPayment.name}</p>
                          <p className="text-sm text-gray-500">
                            Size: {(proofOfPayment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Upload your payment receipt</p>
                        <p className="text-sm text-gray-600 mb-4">
                          Accepted formats: JPG, JPEG, PNG (Max size: 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="payment-proof"
                          disabled={timeRemaining <= 0}
                        />
                        <label
                          htmlFor={timeRemaining <= 0 ? undefined : "payment-proof"}
                          className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
                            timeRemaining <= 0 
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                          }`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {timeRemaining <= 0 ? 'Time Expired' : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Guidelines */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800 mb-2">Upload Guidelines:</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Ensure the receipt shows the transfer amount and bank details clearly</li>
                      <li>• Make sure the image is not blurry and all text is readable</li>
                      <li>• Include the transaction reference number if available</li>
                      <li>• File size should not exceed 5MB</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  {proofOfPayment && (
                    <button
                      onClick={handleSubmitPayment}
                      disabled={uploading || timeRemaining <= 0}
                      className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {timeRemaining <= 0 ? (
                        'Payment Time Expired'
                      ) : uploading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting Payment...
                        </div>
                      ) : (
                        'Submit Payment Proof'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{paymentData.eventName}</h4>
                <p className="text-sm text-gray-600">{paymentData.eventDate}</p>
                <p className="text-sm text-gray-600">{paymentData.eventLocation}</p>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-2">Tickets</h5>
                {paymentData.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between text-sm mb-2">
                    <span>{ticket.name} x{ticket.quantity}</span>
                    <span>Rp {(ticket.price * ticket.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rp {paymentData.subtotal.toLocaleString()}</span>
                </div>
                {paymentData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {paymentData.voucherCode && `(${paymentData.voucherCode})`}</span>
                    <span>-Rp {paymentData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>Rp {paymentData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <PaymentPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}

export default PaymentPage;
