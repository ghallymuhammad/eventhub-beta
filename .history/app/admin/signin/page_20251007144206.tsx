'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to determine admin role from email
  const getAdminRoleFromEmail = (email: string): string => {
    // Check if email is admin
    if (email.includes('admin') || email.includes('superadmin') || email.includes('administrator')) {
      return 'ADMIN';
    }
    // Reject non-admin emails
    return 'INVALID';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (email && password) {
        
        // Determine role from email - only allow admin emails
        const userRole = getAdminRoleFromEmail(email);
        
        if (userRole === 'INVALID') {
          setError('This page is only for administrators. Please use the regular signin page.');
          setIsLoading(false);
          return;
        }
        
        // Mock user data for admin
        const mockUserData = {
          email,
          role: userRole,
          name: email.includes('superadmin') ? 'Super Administrator' : 'System Administrator',
          id: '1'
        };

        // Store in session storage for mock session
        sessionStorage.setItem('mockUser', JSON.stringify(mockUserData));
        
        // Redirect to admin dashboard
        router.push('/admin');
        
        // Force page refresh to update session state
        window.location.reload();
      } else {
        setError('Please fill in all fields');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-red-600 font-medium">Restricted Area - Administrators Only</p>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Sign in to access the EventHub administration panel
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Administrator Email
            </label>
            <input
              className="form-input w-full py-2"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@eventhub.com"
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="form-input w-full py-2"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs font-medium text-red-700">Admin Test Accounts</p>
          </div>
          <div className="text-xs text-red-600 space-y-1">
            <div><strong>Administrator:</strong> admin@eventhub.com / admin123</div>
            <div><strong>Super Admin:</strong> superadmin@eventhub.com / admin123</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <button 
            type="submit"
            disabled={isLoading}
            className="btn w-full bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-sm hover:from-red-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </div>
      </form>

      {/* Bottom links */}
      <div className="mt-6 text-center space-y-2">
        <div className="text-sm text-gray-500">
          Not an administrator?{" "}
          <Link
            className="font-medium text-blue-600 hover:underline"
            href="/signin"
          >
            Regular User Sign In
          </Link>
        </div>
        <div className="text-xs text-gray-400">
          This area is restricted to authorized personnel only
        </div>
      </div>
    </>
  );
}
