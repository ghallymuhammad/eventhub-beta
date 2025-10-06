'use client';

import { useState, useEffect } from 'react';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  availableSeats: number;
}

interface SelectedTicket {
  type: string;
  quantity: number;
  price: number;
  maxQuantity: number;
}

interface TicketSelectorProps {
  eventId: string;
  onTicketsChangeAction: (tickets: SelectedTicket[]) => void;
  initialTickets?: SelectedTicket[];
}

export default function TicketSelector({ eventId, onTicketsChangeAction, initialTickets = [] }: TicketSelectorProps) {
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>(initialTickets);

  // Mock ticket types based on event - in real app this would come from API
  const getAvailableTickets = (id: string): TicketType[] => {
    const ticketTypes: { [key: string]: TicketType[] } = {
      '1': [ // Rock Concert
        {
          id: 'general',
          name: 'General Admission',
          price: 250000,
          description: 'Standard entry with standing area access',
          availableSeats: 500
        },
        {
          id: 'vip',
          name: 'VIP Package',
          price: 500000,
          description: 'Premium seating + meet & greet + merchandise',
          availableSeats: 100
        },
        {
          id: 'premium',
          name: 'Premium Standing',
          price: 350000,
          description: 'Front standing area with better view',
          availableSeats: 200
        }
      ],
      '2': [ // Tech Workshop
        {
          id: 'regular',
          name: 'Regular Ticket',
          price: 150000,
          description: 'Workshop access + lunch + certificate',
          availableSeats: 80
        },
        {
          id: 'early-bird',
          name: 'Early Bird',
          price: 120000,
          description: 'Discounted price for early registration',
          availableSeats: 20
        }
      ],
      '3': [ // Art Exhibition
        {
          id: 'standard',
          name: 'Standard Entry',
          price: 75000,
          description: 'Exhibition access + audio guide',
          availableSeats: 300
        },
        {
          id: 'guided',
          name: 'Guided Tour',
          price: 125000,
          description: 'Personal guide + exclusive access',
          availableSeats: 50
        }
      ]
    };
    
    return ticketTypes[id] || ticketTypes['1'];
  };

  const availableTickets = getAvailableTickets(eventId);

  // Initialize selected tickets with available ticket types
  useEffect(() => {
    if (selectedTickets.length === 0) {
      const initialSelection = availableTickets.map(ticket => ({
        type: ticket.name,
        quantity: 0,
        price: ticket.price,
        maxQuantity: Math.min(10, ticket.availableSeats) // Limit to 10 per person
      }));
      setSelectedTickets(initialSelection);
    }
  }, [availableTickets, selectedTickets.length]);

  const updateQuantity = (ticketType: string, newQuantity: number) => {
    const updatedTickets = selectedTickets.map(ticket => {
      if (ticket.type === ticketType) {
        const clampedQuantity = Math.max(0, Math.min(newQuantity, ticket.maxQuantity));
        return { ...ticket, quantity: clampedQuantity };
      }
      return ticket;
    });
    
    setSelectedTickets(updatedTickets);
    
    // Only pass tickets with quantity > 0 to parent
    const activeTickets = updatedTickets.filter(ticket => ticket.quantity > 0);
    onTicketsChangeAction(activeTickets);
  };

  const getTotalTickets = () => {
    return selectedTickets.reduce((total, ticket) => total + ticket.quantity, 0);
  };

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, ticket) => total + (ticket.quantity * ticket.price), 0);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  const getTicketInfo = (ticketTypeName: string) => {
    return availableTickets.find(ticket => ticket.name === ticketTypeName);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Tickets</h2>
      
      <div className="space-y-6">
        {selectedTickets.map((ticket) => {
          const ticketInfo = getTicketInfo(ticket.type);
          
          return (
            <div key={ticket.type} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{ticket.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ticketInfo?.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(ticket.price)}</span>
                    <span className="text-sm text-gray-500">
                      {ticketInfo?.availableSeats} seats available
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(ticket.type, ticket.quantity - 1)}
                    disabled={ticket.quantity === 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-12 text-center font-semibold text-lg">{ticket.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(ticket.type, ticket.quantity + 1)}
                    disabled={ticket.quantity >= ticket.maxQuantity}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {ticket.quantity > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''})</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(ticket.quantity * ticket.price)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalTickets() > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">Total Tickets:</span>
              <span className="font-bold text-lg">{getTotalTickets()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Price:</span>
              <span className="font-bold text-xl text-blue-600">{formatCurrency(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      )}

      {getTotalTickets() === 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-gray-600">Select tickets to continue with your purchase</p>
          </div>
        </div>
      )}
    </div>
  );
}
