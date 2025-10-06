'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // user, organizer
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Mock registration - in real app, this would be API call
    const userData = {
      email,
      role,
      name,
      isAuthenticated: true
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect based on role
    if (role === 'organizer') {
      router.push('/organizer');
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Join EventHub</h1>
        <p className="text-gray-600 mt-2">
          Create an account to start booking events or organizing your own
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input w-full py-2"
              required
            >
              <option value="user">Event Attendee</option>
              <option value="organizer">Event Organizer</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose "Event Attendee" to book tickets, or "Event Organizer" to create and manage events
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Full name
            </label>
            <input
              id="name"
              className="form-input w-full py-2"
              type="text"
              placeholder={role === 'organizer' ? 'Your Organization Name' : 'Your Full Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              className="form-input w-full py-2"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              id="password"
              className="form-input w-full py-2"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className="form-input w-full py-2"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button 
            type="submit"
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%]"
          >
            {role === 'organizer' ? 'Create Organizer Account' : 'Create Account'}
          </button>
        </div>
      </form>

      {/* Bottom link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            className="whitespace-nowrap font-medium text-blue-600 underline hover:no-underline"
            href="/signin"
          >
            Sign in here
          </Link>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </>
  );
}
