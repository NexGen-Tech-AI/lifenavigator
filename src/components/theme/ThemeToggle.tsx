// src/components/theme/ThemeToggle.tsx
'use client';

import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
      <button
        onClick={() => setTheme('light')}
        className={`rounded p-1.5 ${
          theme === 'light' 
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
        }`}
        aria-label="Light Mode"
        type="button"
      >
        <SunIcon className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`rounded p-1.5 ${
          theme === 'dark' 
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark Mode"
        type="button"
      >
        <MoonIcon className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`rounded p-1.5 ${
          theme === 'system' 
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' 
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
        }`}
        aria-label="System Mode"
        type="button"
      >
        <ComputerDesktopIcon className="h-5 w-5" />
      </button>
    </div>
  );
}