import './polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { configurePkcOptions } from './lib/pkc-options';
import './index.css';

// The hooks read window.defaultPkcOptions when they first load, so configure it before importing the app.
configurePkcOptions();
// Development inspectors (Agentation, element-source); the guarded import is dropped from production builds.
if (import.meta.env.DEV) void import('./lib/dev-tools');
const { default: App } = await import('./app');

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
