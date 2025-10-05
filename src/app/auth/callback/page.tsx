'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for hash fragments first (OAuth response)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        
        // Check for query parameters (email verification)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const verificationError = urlParams.get('error');

        if (hashParams.get('access_token')) {
          // Handle OAuth response from hash fragments
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresAt = hashParams.get('expires_at');

          if (accessToken && refreshToken && expiresAt) {
            try {
              // First, create or update user in database
              const response = await fetch('/api/auth/oauth-callback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: parseInt(expiresAt),
                }),
              });

              if (response.ok) {
                // Store session in localStorage
                const session = {
                  access_token: accessToken,
                  refresh_token: refreshToken,
                  expires_at: parseInt(expiresAt),
                };

                localStorage.setItem('supabase_session', JSON.stringify(session));
                
                // Trigger storage event to notify AuthContext
                window.dispatchEvent(new StorageEvent('storage', {
                  key: 'supabase_session',
                  newValue: JSON.stringify(session),
                  storageArea: localStorage,
                }));

                // Redirect to main page
                router.push('/');
                return;
              } else {
                throw new Error('Failed to create user');
              }
            } catch (err) {
              console.error('User creation error:', err);
              router.push('/auth/login?error=user_creation_failed');
              return;
            }
          }
        }

        if (code) {
          // Handle email verification with server-side processing
          try {
            const response = await fetch(`/api/auth/verify-email?code=${code}`);
            
            if (response.ok) {
              // Email verification successful
              router.push('/auth/login?verified=true');
              return;
            } else {
              // Email verification failed
              router.push('/auth/login?error=verification_failed');
              return;
            }
          } catch (err) {
            console.error('Email verification error:', err);
            router.push('/auth/login?error=verification_failed');
            return;
          }
        }

        if (verificationError) {
          // Handle verification errors
          router.push(`/auth/login?error=${verificationError}`);
          return;
        }

        // If no valid parameters found, redirect to login
        router.push('/auth/login?error=invalid_callback');
        
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed');
        setTimeout(() => {
          router.push('/auth/login?error=callback_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
