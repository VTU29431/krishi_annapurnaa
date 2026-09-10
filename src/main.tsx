import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unhandled WebSocket closure, Vite HMR disconnect rejections, or cross-origin script errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('[vite]') ||
      msg === 'Script error.'
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg =
      typeof reason === 'string'
        ? reason
        : reason?.message || reason?.stack || String(reason || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('closed without opened') ||
      msg.includes('[vite]')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
