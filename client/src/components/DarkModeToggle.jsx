import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "vesselTrackerDarkMode";

const DarkModeToggle = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } 
    // Then check system preference
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Update the theme when darkMode changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark:bg-slate-900');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark:bg-slate-900');
    }
    
    // Save preference to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(darkMode));
  }, [darkMode, mounted]);

  // Handle system theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if we don't have a saved preference
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  if (!mounted) {
    // Prevent hydration mismatch by rendering a placeholder
    return (
      <button 
        className={`w-9 h-9 rounded-full bg-transparent ${className}`}
        aria-label="Toggle dark mode"
      />
    );
  }

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 ${
        darkMode 
          ? 'text-amber-400 hover:bg-slate-700' 
          : 'text-slate-600 hover:bg-slate-100'
      } ${className}`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default DarkModeToggle;