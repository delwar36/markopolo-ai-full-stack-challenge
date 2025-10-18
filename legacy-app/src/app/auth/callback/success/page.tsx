'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthCallbackSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get session data from URL parameters
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresAt = searchParams.get('expires_at');

    if (accessToken && refreshToken && expiresAt) {
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
    } else {
      // If no session data, redirect to login with error
      router.push('/auth/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
