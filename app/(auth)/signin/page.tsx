'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { findDemoUser } from "@/lib/demo-users";

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
      // Check for admin email redirect
      try {
        getUserRoleFromEmail(email);
      } catch (roleError: any) {
        setError(roleError.message);
        setIsLoading(false);
        return;
      }

      // First check if it's a demo user
      const demoUser = findDemoUser(email, password);
      
      if (demoUser) {
        // Demo user found - create mock session
        const mockSession = {
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            profilePicture: demoUser.profilePicture,
          }
        };

        // Store in sessionStorage for demo purposes
        sessionStorage.setItem('mockSession', JSON.stringify(mockSession));
        
        // Redirect based on role
        if (demoUser.role === 'ORGANIZER') {
          router.push('/organizer');
        } else if (demoUser.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        
        // Force page refresh to update header state
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return;
      }

      // If not a demo user, try NextAuth
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please check the demo credentials in the gray box below.');
        setIsLoading(false);
        return;
      }

      // Get the session to determine redirect URL
      const session = await getSession();
      if (session?.user) {
        // Redirect based on user role
        if (session.user.role === 'ORGANIZER') {
          router.push('/organizer');
        } else if (session.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh(); // Refresh to update session state
      } else {
        setError('Authentication failed. Please use the demo credentials provided below.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Sign in failed. Please use the demo credentials provided below.');
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
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs text-gray-500 mb-2">Administrator?</p>
          <Link
            className="text-sm font-medium text-red-600 hover:text-red-700 underline hover:no-underline"
            href="/admin/signin"
          >
            Admin Sign In →
          </Link>
        </div>
      </div>
    </>
  );
}
