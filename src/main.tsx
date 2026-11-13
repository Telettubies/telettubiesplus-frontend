import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './shared/styles/tailwind.tokens.css';
import './shared/styles/custom-themes.css';

(globalThis as any).__VITE_ENV__ = import.meta.env;

// Los enlaces de invitación y recuperación de Supabase llegan a la Site URL (raíz) con el token en
// el fragmento. Se llevan a /invitacion, donde el usuario define su contraseña, antes de montar la app.
if (/(^|[#&])type=(invite|recovery)(&|$)/.test(window.location.hash) && window.location.pathname !== '/invitacion') {
  window.history.replaceState(null, '', `/invitacion${window.location.search}${window.location.hash}`);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
