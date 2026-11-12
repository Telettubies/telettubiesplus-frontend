import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './shared/styles/tailwind.tokens.css';
import './shared/styles/custom-themes.css';

(globalThis as any).__VITE_ENV__ = import.meta.env;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
