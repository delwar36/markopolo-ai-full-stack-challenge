'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  showTitle?: boolean;
}

export default function ThemeToggle({ showTitle = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={showTitle ? "Change Theme" : `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
      <div className="flex items-center space-x-1">
        {theme === 'light' ? (
          <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
        {showTitle && (
          <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
            Change Theme
          </span>
        )}
      </div>
    </button>
  );
}
