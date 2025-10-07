'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to determine user role from email
  const getUserRoleFromEmail = (email: string): string => {
    // Check email patterns to determine role
    const emailLower = email.toLowerCase();
    
    // Organizer patterns
    if (emailLower.includes('organizer') || 
        emailLower.includes('event') || 
        emailLower.includes('music') ||
        emailLower.includes('company') ||
        emailLower.includes('corp') ||
        emailLower.includes('organization')) {
      return 'ORGANIZER';
    }
    
    // Admin users should use the admin signin page
    if (emailLower.includes('admin')) {
      throw new Error('Admin users should use the admin signin page at /admin/signin');
    }
    
    // Default to user role
    return 'USER';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // For testing purposes, create a mock signin that works with our burger menu
      // In production, this would authenticate against the database
      if (email && password) {
        
        // Determine role from email
        let userRole: string;
        try {
          userRole = getUserRoleFromEmail(email);
        } catch (roleError: any) {
          setError(roleError.message);
          setIsLoading(false);
          return;
        }
        
        // Mock user data based on email for testing
        const mockUserData = {
          email,
          role: userRole,
          name: userRole === 'ORGANIZER' ? 'Music Events Indonesia' : 'Ahmad Rahman',
          id: '1'
        };

        // Store in session storage for mock session
        sessionStorage.setItem('mockUser', JSON.stringify(mockUserData));
        
        // For now, we'll use a simple redirect since the database isn't set up
        // Redirect based on detected role
        if (userRole === 'ORGANIZER') {
          router.push('/organizer');
        } else {
          router.push('/');
        }
        
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
        <h1 className="text-4xl font-bold">Sign in to EventHub</h1>
        <p className="text-gray-600 mt-2">
          Access your account to manage events or book tickets
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
              Email
            </label>
            <input
              className="form-input w-full py-2"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
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
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-2">
            <div>
              <strong>Regular User:</strong> user@demo.com / demo123
            </div>
            <div>
              <strong>Event Organizer:</strong> organizer@eventcompany.com / demo123
            </div>
            <div className="text-xs text-gray-400 mt-2">
              * Role is automatically detected from email address
            </div>
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
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Bottom links */}
      <div className="mt-6 text-center space-y-2">
        <div>
          <Link
            className="text-sm text-gray-700 underline hover:no-underline"
            href="/reset-password"
          >
            Forgot password
          </Link>
        </div>
        <div>
          <Link
            className="text-sm text-blue-600 underline hover:no-underline"
            href="/"
          >
            Continue as Guest (Browse Only)
          </Link>
        </div>
      </div>
    </>
  );
}
