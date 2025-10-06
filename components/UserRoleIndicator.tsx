'use client';

import { useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

export default function UserRoleIndicator() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 shadow-lg z-50">
        <div className="text-sm">
          <div className="font-medium text-gray-900">👤 Guest Mode</div>
          <div className="text-gray-600">Browse events only</div>
        </div>
      </div>
    );
  }

  const roleConfig = {
    user: {
      icon: '🎫',
      label: 'Event Attendee',
      description: 'Book tickets & reviews',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    organizer: {
      icon: '🎪',
      label: 'Event Organizer', 
      description: 'Create & manage events',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    }
  };

  const config = roleConfig[user.role as keyof typeof roleConfig];

  return (
    <div className={`fixed bottom-4 right-4 ${config.color} border rounded-lg px-4 py-2 shadow-lg z-50`}>
      <div className="text-sm">
        <div className="font-medium">{config.icon} {config.label}</div>
        <div className="opacity-75">{config.description}</div>
      </div>
    </div>
  );
}
