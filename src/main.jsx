import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/layout/ToastProvider';
import './index.css';

const savedTheme = (() => {
  try {
    const t = localStorage.getItem('depthforge-theme');
    if (t === 'dark' || t === 'light') return t;
  } catch {
    /* empty */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
document.documentElement.classList.toggle('dark', savedTheme === 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

