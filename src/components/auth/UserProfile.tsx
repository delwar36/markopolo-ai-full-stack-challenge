'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  isCollapsed?: boolean;
}

export default function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  // If no user, show login button instead of profile
  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={() => router.push('/auth/login')}
          className="flex items-center space-x-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="relative w-8 h-8 bg-gray-400 text-white rounded-full select-none min-w-[2rem] min-h-[2rem]">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sign In
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Access your account
              </p>
            </div>
          )}
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name?: string) => {
    if (!name || name.trim() === '') return 'U';
    
    // Clean the name and split by spaces
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) return 'U';
    
    // Get first letter of first word
    const firstInitial = words[0][0]?.toUpperCase() || 'U';
    
    // Get first letter of second word if it exists
    const secondInitial = words.length > 1 ? (words[1][0]?.toUpperCase() || '') : '';
    
    const result = firstInitial + secondInitial;
    
    // Debug log to help troubleshoot
    console.log('UserProfile - Name:', name, 'Initials:', result);
    
    return result;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="relative w-8 h-8 bg-blue-600 text-white rounded-full select-none min-w-[2rem] min-h-[2rem]">
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold leading-none">
            {getInitials(user.name)}
          </span>
        </div>
        {!isCollapsed && (
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        )}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
