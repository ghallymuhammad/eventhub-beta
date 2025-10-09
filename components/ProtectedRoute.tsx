'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: string;
  name: string;
  isAuthenticated: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('mockSession');
    
    if (!userData) {
      // No user data, redirect to sign in
      router.push(redirectTo);
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      let user: User;

      // Handle mock session format vs direct user format
      if (parsedData.user) {
        // Mock session format from signin
        user = {
          email: parsedData.user.email,
          role: parsedData.user.role.toLowerCase(),
          name: parsedData.user.name,
          isAuthenticated: true,
        };
      } else {
        // Direct user format
        user = parsedData as User;
      }
      
      if (!user.isAuthenticated || !allowedRoles.includes(user.role)) {
        // User not authenticated or doesn't have required role
        router.push(redirectTo);
        return;
      }

      setUser(user);
    } catch (error) {
      // Invalid user data, redirect to sign in
      localStorage.removeItem('user');
      sessionStorage.removeItem('mockSession');
      router.push(redirectTo);
      return;
    }
    
    setIsLoading(false);
  }, [router, allowedRoles, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please sign in with the appropriate account type.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/signin')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
}
