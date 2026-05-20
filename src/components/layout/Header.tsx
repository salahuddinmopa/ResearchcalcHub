// src/components/layout/Header.tsx
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">ResearchCalcHub</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600"/> : <Sun className="w-5 h-5 text-yellow-400"/>}
      </button>
    </header>
  );
};
