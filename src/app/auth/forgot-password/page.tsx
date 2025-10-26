"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState('');
  const [resetOption, setResetOption] = useState<'link' | 'otp' | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // First, just validate the email exists in the system
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'Something went wrong');
      }

      // Show reset options without sending email yet
      setShowOptions(true);
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetOptionSelect = async (option: 'link' | 'otp') => {
    setResetOption(option);
    setIsSubmitting(true);
    
    try {
      // Now send the email with the selected method
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          method: option // Send the selected method to the API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setEmailSent(true);
      
      // If OTP option is selected, redirect to OTP verification page
      if (option === 'otp') {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send recovery email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {!showOptions 
            ? "Enter your email to receive password reset instructions" 
            : emailSent 
              ? "Check your email for instructions" 
              : "Choose how you want to reset your password"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showOptions ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Continue'}
                </button>
              </div>

              <div className="text-sm text-center">
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Back to login
                </Link>
              </div>
            </form>
          ) : emailSent ? (
            <div>
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Email sent</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>We've sent instructions to reset your password to {email}. Please check your inbox.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Please select how you would like to reset your password for {email}:
              </p>
              
              {/* Reset Options */}
              <div className="mt-4 space-y-4">                
                <button
                  onClick={() => handleResetOptionSelect('link')}
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-between p-4 border rounded-md ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="text-sm font-medium text-gray-900">Reset with Email Link</h4>
                      <p className="text-sm text-gray-500">We'll send a link to your email to reset your password</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleResetOptionSelect('otp')}
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-between p-4 border rounded-md ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-4 text-left">
                      <h4 className="text-sm font-medium text-gray-900">Reset with OTP</h4>
                      <p className="text-sm text-gray-500">We'll send a 6-digit code to your email</p>
                    </div>
                  </div>
                </button>

                {isSubmitting && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Sending email... Please wait.
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center text-sm">
                <button 
                  onClick={() => setShowOptions(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ← Change email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 