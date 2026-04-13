import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import './index.css';

console.log('Main.tsx is being executed');

// Determine initial theme
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const initialColorScheme = savedTheme === 'dark' || (savedTheme === null && prefersDarkMode) ? 'dark' : 'light';

// Set initial document class
document.documentElement.classList.add(initialColorScheme === 'dark' ? 'dark-mode' : 'light-mode');

// Simple theme for Mantine v6 - only specify colorScheme
const theme = {
  colorScheme: initialColorScheme as 'light' | 'dark',
};

const AppWrapper = () => {
  return <App />;
};

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  try {
    console.log('Attempting to render React app...');
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <ModalsProvider>
            <Notifications />
            <AppWrapper />
          </ModalsProvider>
        </MantineProvider>
      </React.StrictMode>,
    );
    
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
} else {
  console.error('Root element not found');
}