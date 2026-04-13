import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import './index.css';

// Determine initial theme
const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
const initialColorScheme = savedTheme === 'dark' || (savedTheme === null && prefersDarkMode) ? 'dark' : 'light';

// Set initial document class
document.documentElement.classList.add(initialColorScheme === 'dark' ? 'dark-mode' : 'light-mode');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: initialColorScheme as 'light' | 'dark' }}>
      <Notifications />
      <ModalsProvider>
        <App />
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>,
);