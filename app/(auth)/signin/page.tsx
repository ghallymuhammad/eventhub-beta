'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user, organizer
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - in real app, this would be API call
    if (email && password) {
      // Store user data in localStorage (in real app, use proper auth tokens)
      const userData = {
        email,
        role,
        name: role === 'organizer' ? 'Music Events Indonesia' : 'Ahmad Rahman',
        isAuthenticated: true
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on role
      if (role === 'organizer') {
        router.push('/organizer');
      } else {
        router.push('/');
      }
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
          {/* Role Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  role === 'user' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">🎫</div>
                  <div>Event Attendee</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  role === 'organizer' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">🎪</div>
                  <div>Event Organizer</div>
                </div>
              </button>
            </div>
          </div>

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
              placeholder={role === 'organizer' ? 'organizer@eventcompany.com' : 'user@email.com'}
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
          {role === 'user' ? (
            <div className="text-xs text-gray-500">
              <div>Email: user@demo.com</div>
              <div>Password: demo123</div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              <div>Email: organizer@demo.com</div>
              <div>Password: admin123</div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button 
            type="submit"
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%]"
          >
            Sign in as {role === 'organizer' ? 'Organizer' : 'Attendee'}
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
