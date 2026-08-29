import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initAnalytics } from './lib/analytics.ts';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Inert unless a measurement id is configured AND the page is on the canonical
// host; see src/lib/analytics.ts.
initAnalytics();
