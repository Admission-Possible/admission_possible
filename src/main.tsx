import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

const root = document.getElementById('root')!;

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
        {/* Cookieless, no PII, beaconed same-origin — allowed by the strict CSP as-is. */}
        <Analytics />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

// Routes are prerendered to real HTML (see scripts/prerender.mjs), so attach to
// that markup instead of throwing it away and re-rendering from scratch.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, tree);
} else {
  ReactDOM.createRoot(root).render(tree);
}
