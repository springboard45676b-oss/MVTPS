// client/src/components/DarkModeToggle.jsx

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode from localStorage and system preference
  useEffect(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      const isDark = JSON.parse(savedMode);
      setIsDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
    
    setMounted(true);
  }, []);

  const applyDarkMode = (isDark) => {
    const html = document.documentElement;
    
    if (isDark) {
      html.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a'; // slate-950
    } else {
      html.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff'; // white
    }
  };

  const handleToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-in-out
        hover:scale-110
        ${isDarkMode 
          ? 'text-yellow-400 hover:text-yellow-300' 
          : 'text-slate-700 hover:text-slate-900'
        }
      `}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun 
          size={20} 
          className="transition-transform duration-300 rotate-0 hover:rotate-180"
        />
      ) : (
        <Moon 
          size={20} 
          className="transition-transform duration-300 rotate-0 hover:rotate-180"
        />
      )}
    </button>
  );
};

export default DarkModeToggle;