import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "vesselTrackerDarkMode";

const DarkModeToggle = ({ className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Update the theme when darkMode changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark:bg-slate-900');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark:bg-slate-900');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(darkMode));
  }, [darkMode, mounted]);

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