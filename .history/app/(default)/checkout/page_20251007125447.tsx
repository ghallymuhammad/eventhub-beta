'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import TicketSelector from '@/components/TicketSelector';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('event');
  
  const [selectedTickets, setSelectedTickets] = useState<Array<{type: string, quantity: number, price: number}>>([]);
  
  const [pointsBalance] = useState(50000);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  // Map event IDs to event names for mock data
  const getEventData = (id: string | null) => {
    const eventMap: { [key: string]: any } = {
      'rock-concert-2025': {
        name: 'Rock Concert 2025',
        date: '2025-10-15',
        time: '20:00',
        location: 'Jakarta Convention Center, Jakarta, Indonesia',
        organizer: 'Rock Events Indonesia'
      },
      'tech-workshop': {
        name: 'Tech Workshop 2025',
        date: '2025-10-20',
        time: '09:00',
        location: 'Bandung Institute of Technology, Bandung, Indonesia',
        organizer: 'Tech Community Bandung'
      },
      'art-exhibition': {
        name: 'Art Exhibition',
        date: '2025-11-05',
        time: '10:00',
        location: 'Yogya Art Gallery, Yogyakarta, Indonesia',
        organizer: 'Yogya Art Gallery'
      }
    };
    
    return eventMap[id || 'rock-concert-2025'] || eventMap['rock-concert-2025'];
  };

  const eventData = getEventData(eventId);

  // Mock vouchers
  const availableVouchers = [
    { code: 'EARLY25', discount: 25000, minPurchase: 200000 },
    { code: 'STUDENT50', discount: 50000, minPurchase: 300000 }
  ];



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return selectedTickets.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);
  };

  const calculateTotal = () => {
    let total = calculateSubtotal();
    
    // Apply points discount
    if (usePoints && pointsToUse > 0) {
      total -= pointsToUse;
    }
    
    // Apply voucher discount
    if (appliedVoucher) {
      total -= appliedVoucher.discount;
    }
    
    return Math.max(0, total);
  };

  const applyVoucher = () => {
    const voucher = availableVouchers.find(v => v.code === voucherCode.toUpperCase());
    const subtotal = calculateSubtotal();
    
    if (voucher && subtotal >= voucher.minPurchase) {
      setAppliedVoucher(voucher);
      alert(`Voucher ${voucher.code} applied! You saved ${formatCurrency(voucher.discount)}`);
    } else if (voucher && subtotal < voucher.minPurchase) {
      alert(`Minimum purchase of ${formatCurrency(voucher.minPurchase)} required for this voucher`);
    } else {
      alert('Invalid voucher code');
    }
  };

  const handlePointsChange = (amount: number) => {
    const maxPoints = Math.min(pointsBalance, calculateSubtotal());
    setPointsToUse(Math.min(Math.max(0, amount), maxPoints));
  };

  const handleTicketsChange = (tickets: Array<{type: string, quantity: number, price: number}>) => {
    setSelectedTickets(tickets);
  };

  const proceedToPayment = () => {
    if (!eventData) return;

    // Prepare payment data
    const paymentData = {
      eventId: eventId || '1',
      eventName: eventData.name,
      eventDate: `${new Date(eventData.date).toLocaleDateString('id-ID')} at ${eventData.time}`,
      eventLocation: eventData.location,
      tickets: selectedTickets.map((ticket, index) => ({
        id: index.toString(),
        name: ticket.type,
        price: ticket.price,
        quantity: ticket.quantity
      })),
      subtotal: calculateSubtotal(),
      discount: (usePoints ? pointsToUse : 0) + (appliedVoucher ? appliedVoucher.discount : 0),
      total: calculateTotal(),
      voucherCode: appliedVoucher?.code
    };

    // Store payment data for the payment page
    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));

    // Navigate to payment page
    const queryString = encodeURIComponent(JSON.stringify(paymentData));
    router.push(`/payment?data=${queryString}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Timer */}
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">Complete Your Purchase</h2>
                <p className="text-yellow-700">Upload payment proof within the time limit</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-800">{formatTime(timeRemaining)}</div>
                <div className="text-sm text-yellow-600">Time Remaining</div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Review your order and complete payment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details & Order */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{eventData.name}</h3>
                  <p className="text-gray-600">by {eventData.organizer}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(eventData.date).toLocaleDateString('id-ID')} at {eventData.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {eventData.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <TicketSelector 
              eventId={eventId || '1'}
              onTicketsChangeAction={handleTicketsChange}
              initialTickets={selectedTickets.map(ticket => ({
                ...ticket,
                maxQuantity: 10
              }))}
            />

            {/* Points & Vouchers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Discounts</h2>
              
              {/* Points Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">Use Points</span>
                  </label>
                  <span className="text-sm text-gray-600">Available: {formatCurrency(pointsBalance)}</span>
                </div>
                
                {usePoints && (
                  <div>
                    <input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
                      max={Math.min(pointsBalance, calculateSubtotal())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter points to use"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Max: {formatCurrency(Math.min(pointsBalance, calculateSubtotal()))}
                    </p>
                  </div>
                )}
              </div>

              {/* Voucher Section */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">Voucher Code</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter voucher code"
                  />
                  <button
                    onClick={applyVoucher}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                
                {appliedVoucher && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                    Voucher {appliedVoucher.code} applied: -{formatCurrency(appliedVoucher.discount)}
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Available vouchers:</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    {availableVouchers.map(voucher => (
                      <div key={voucher.code}>
                        <span className="font-medium">{voucher.code}</span>: {formatCurrency(voucher.discount)} off 
                        (min. {formatCurrency(voucher.minPurchase)})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                {usePoints && pointsToUse > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-{formatCurrency(pointsToUse)}</span>
                  </div>
                )}
                
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span>-{formatCurrency(appliedVoucher.discount)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                disabled={timeRemaining <= 0 || selectedTickets.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {timeRemaining <= 0 ? 'Time Expired' : selectedTickets.length === 0 ? 'Select Tickets to Continue' : 'Proceed to Payment'}
              </button>

              <div className="mt-4 text-xs text-gray-500">
                <p>• Payment proof must be uploaded within 2 hours</p>
                <p>• Admin will confirm payment within 3 days</p>
                <p>• Points and vouchers will be refunded if transaction fails</p>
                <p>• All prices are in Indonesian Rupiah (IDR)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}
