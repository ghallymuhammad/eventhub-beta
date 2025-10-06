'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface TicketType {
  id: string;
  name: string;
  price: number;
  seats: number;
  description?: string;
}

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  eventSpecific: boolean;
  minPurchase?: number;
}

interface ReferralVoucher {
  id: string;
  code: string;
  discountValue: number;
  validDays: number;
  isActive: boolean;
}

function CreateEventPage() {
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '', 
    location: '',
    category: '',
    image: '',
    isFree: true,
    totalSeats: 100,
    ticketTypes: [
      { 
        id: '1', 
        name: 'General Admission', 
        price: 0, 
        seats: 100,
        description: 'Standard entry to the event'
      }
    ] as TicketType[],
    vouchers: [] as Voucher[],
    referralVoucher: null as ReferralVoucher | null
  });

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    validFrom: '',
    validUntil: '',
    maxUses: 100,
    minPurchase: 0
  });

  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);

  const categories = [
    'Music & Concerts',
    'Business & Technology',
    'Arts & Culture', 
    'Sports & Fitness',
    'Food & Drink',
    'Education & Learning',
    'Health & Wellness',
    'Fashion & Beauty',
    'Travel & Adventure',
    'Entertainment',
    'Community & Social',
    'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTicketTypeChange = (index: number, field: string, value: any) => {
    const updatedTicketTypes = [...eventData.ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [field]: value
    };
    setEventData(prev => ({
      ...prev,
      ticketTypes: updatedTicketTypes
    }));
  };

  const addTicketType = () => {
    const newId = Date.now().toString();
    setEventData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { 
        id: newId,
        name: '',
        price: 0,
        seats: 0,
        description: ''
      }]
    }));
  };

  const removeTicketType = (index: number) => {
    if (eventData.ticketTypes.length > 1) {
      setEventData(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
      }));
    }
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const addVoucher = () => {
    if (!newVoucher.code || !newVoucher.validFrom || !newVoucher.validUntil) {
      alert('Please fill in all required fields');
      return;
    }

    const voucher: Voucher = {
      id: Date.now().toString(),
      code: newVoucher.code,
      discountType: newVoucher.discountType,
      discountValue: newVoucher.discountValue,
      validFrom: newVoucher.validFrom,
      validUntil: newVoucher.validUntil,
      maxUses: newVoucher.maxUses,
      currentUses: 0,
      isActive: true,
      eventSpecific: true,
      minPurchase: newVoucher.minPurchase
    };

    setEventData(prev => ({
      ...prev,
      vouchers: [...prev.vouchers, voucher]
    }));

    // Reset form
    setNewVoucher({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      validFrom: '',
      validUntil: '',
      maxUses: 100,
      minPurchase: 0
    });
    setShowVoucherForm(false);
  };

  const removeVoucher = (id: string) => {
    setEventData(prev => ({
      ...prev,
      vouchers: prev.vouchers.filter(v => v.id !== id)
    }));
  };

  const createReferralVoucher = () => {
    const referralVoucher: ReferralVoucher = {
      id: Date.now().toString(),
      code: `REF${generateVoucherCode()}`,
      discountValue: 10, // 10% discount for referrals
      validDays: 30, // Valid for 30 days
      isActive: true
    };

    setEventData(prev => ({
      ...prev,
      referralVoucher
    }));
    setShowReferralForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!eventData.name || !eventData.startDate || !eventData.location) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would normally send the data to your backend
    console.log('Event Data:', eventData);
    alert('Event created successfully! (This is a demo - no backend integration yet)');
  };

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600 mt-2">Fill out the details below to create your event</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Event Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={eventData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter event name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={eventData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={eventData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your event..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={eventData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Event venue or address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Image URL
                    </label>
                    <input
                      type="url"
                      value={eventData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Date & Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={eventData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={eventData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={eventData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Tickets */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Tickets</h2>
                
                {/* Free/Paid Toggle */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricing"
                        checked={eventData.isFree}
                        onChange={() => handleInputChange('isFree', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Free Event</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="pricing"
                        checked={!eventData.isFree}
                        onChange={() => handleInputChange('isFree', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Paid Event</span>
                    </label>
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Ticket Types</h3>
                    <button
                      type="button"
                      onClick={addTicketType}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Add Ticket Type
                    </button>
                  </div>

                  {eventData.ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ticket Name
                          </label>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., VIP, General"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (IDR)
                          </label>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => handleTicketTypeChange(index, 'price', Number(e.target.value))}
                            disabled={eventData.isFree}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Seats
                          </label>
                          <input
                            type="number"
                            value={ticket.seats}
                            onChange={(e) => handleTicketTypeChange(index, 'seats', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>

                        <div className="flex items-end">
                          {eventData.ticketTypes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTicketType(index)}
                              className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={ticket.description || ''}
                          onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description of this ticket type"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vouchers & Promotions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vouchers & Promotions</h2>
                
                {/* Existing Vouchers */}
                {eventData.vouchers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Active Vouchers</h3>
                    <div className="space-y-3">
                      {eventData.vouchers.map((voucher) => (
                        <div key={voucher.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <span className="font-mono font-bold text-blue-600">{voucher.code}</span>
                              <span className="text-sm text-gray-600">
                                {voucher.discountType === 'percentage' 
                                  ? `${voucher.discountValue}% off` 
                                  : `Rp ${voucher.discountValue.toLocaleString()} off`}
                              </span>
                              <span className="text-sm text-gray-500">
                                {voucher.validFrom} to {voucher.validUntil}
                              </span>
                              <span className="text-sm text-gray-500">
                                Max uses: {voucher.maxUses}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVoucher(voucher.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Voucher Button */}
                {!showVoucherForm && (
                  <button
                    type="button"
                    onClick={() => setShowVoucherForm(true)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors mb-4"
                  >
                    + Add Promotional Voucher
                  </button>
                )}

                {/* Voucher Creation Form */}
                {showVoucherForm && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Create Voucher</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Voucher Code
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newVoucher.code}
                            onChange={(e) => setNewVoucher(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="SUMMER25"
                          />
                          <button
                            type="button"
                            onClick={() => setNewVoucher(prev => ({ ...prev, code: generateVoucherCode() }))}
                            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={newVoucher.discountType}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount (IDR)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          value={newVoucher.discountValue}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={newVoucher.discountType === 'percentage' ? '10' : '50000'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Purchase (IDR)
                        </label>
                        <input
                          type="number"
                          value={newVoucher.minPurchase}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, minPurchase: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valid From
                        </label>
                        <input
                          type="date"
                          value={newVoucher.validFrom}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, validFrom: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={newVoucher.validUntil}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Uses
                        </label>
                        <input
                          type="number"
                          value={newVoucher.maxUses}
                          onChange={(e) => setNewVoucher(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowVoucherForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addVoucher}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Voucher
                      </button>
                    </div>
                  </div>
                )}

                {/* Referral Voucher */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Referral Program</h3>
                  
                  {eventData.referralVoucher ? (
                    <div className="rounded-lg p-4 border border-green-200 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Referral voucher created:</p>
                          <p className="font-mono font-bold text-green-600">{eventData.referralVoucher.code}</p>
                          <p className="text-sm text-gray-600">10% discount • Valid for 30 days after referral registration</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEventData(prev => ({ ...prev, referralVoucher: null }))}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Create a referral voucher that will be automatically given to new users when they register through a referral link.
                      </p>
                      <button
                        type="button"
                        onClick={createReferralVoucher}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Enable Referral Program
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function CreateEvent() {
  return <CreateEventPage />;
}
