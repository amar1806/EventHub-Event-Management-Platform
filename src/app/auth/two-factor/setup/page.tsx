"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function TwoFactorSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      checkTwoFactorStatus();
    }
  }, [status, router]);
  
  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/two-factor/status');
      const data = await response.json();
      
      if (response.ok && data.enabled) {
        setIsEnabled(true);
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
    }
  };
  
  const generateQrCode = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/two-factor/generate');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code');
      }
      
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/two-factor/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          secret: secret,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }
      
      setSuccessMessage('Two-factor authentication enabled successfully');
      setIsEnabled(true);
      setQrCode(null);
      setSecret(null);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const disableTwoFactor = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/two-factor/disable', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable two-factor authentication');
      }
      
      setSuccessMessage('Two-factor authentication disabled successfully');
      setIsEnabled(false);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable two-factor authentication');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto p-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-40 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6 mt-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <Link 
            href="/profile" 
            className="text-blue-600 hover:underline"
          >
            Back to Profile
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {successMessage}
          </div>
        )}
        
        {isEnabled ? (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Two-factor authentication is enabled</p>
              <p className="text-sm mt-1">Your account is secured with an additional layer of protection.</p>
            </div>
            
            <div className="mt-8">
              <button
                onClick={disableTwoFactor}
                disabled={isLoading}
                className={`w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-6">
              Two-factor authentication adds an extra layer of security to your account by requiring 
              a verification code from your mobile device in addition to your password.
            </p>
            
            {!qrCode ? (
              <div className="mt-6">
                <button
                  onClick={generateQrCode}
                  disabled={isGenerating}
                  className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Set Up Two-Factor Authentication'}
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-medium mb-2">1. Scan QR Code</h2>
                  <p className="text-gray-700 mb-4">
                    Scan this QR code with your authentication app (like Google Authenticator or Authy)
                  </p>
                  <div className="flex justify-center my-6">
                    <div className="p-2 border border-gray-300 rounded-lg bg-white">
                      <Image 
                        src={qrCode}
                        alt="QR Code for two-factor authentication"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>
                  
                  {secret && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-700 mb-1">Or enter this code manually:</p>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {secret}
                      </code>
                    </div>
                  )}
                </div>
                
                <form onSubmit={verifyAndEnable} className="mt-8">
                  <h2 className="text-lg font-medium mb-2">2. Verify Code</h2>
                  <p className="text-gray-700 mb-4">
                    Enter the verification code shown in your authentication app
                  </p>
                  
                  <div>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Verifying...' : 'Verify and Enable'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}