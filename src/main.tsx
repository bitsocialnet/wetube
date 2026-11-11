import './polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { translationsReady } from './lib/init-translations';
import { configurePkcOptions } from './lib/pkc-options';
import { initTheme } from './lib/theme';
import './index.css';

// The hooks read window.defaultPkcOptions when they first load, so configure it before importing the app.
configurePkcOptions();
// Before the first render, so the page never flashes the wrong theme.
initTheme();
// Development inspectors (Agentation, element-source); the guarded import is dropped from production builds.
if (import.meta.env.DEV) void import('./lib/dev-tools');
// The interface strings load alongside the app's code; English is bundled, so only another language waits.
const [{ default: App }] = await Promise.all([import('./app'), translationsReady]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
