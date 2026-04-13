import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useDarkMode() {
  console.log('useDarkMode hook initializing');
  
  // Initialize state with user preference or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      console.log('Theme from localStorage:', savedTheme);
      return savedTheme;
    }
    
    // Otherwise check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('Using system preference: dark mode');
      return 'dark';
    }
    
    // Default to light mode
    console.log('Defaulting to light mode');
    return 'light';
  });

  useEffect(() => {
    console.log('Theme changed to:', theme);
    
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme);
    
    // Update document body classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
      console.log('Applied dark-mode class to document');
    } else {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      console.log('Applied light-mode class to document');
    }
    
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    console.log('Toggle theme called');
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}