import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
        {/* Cookieless, no PII, beaconed same-origin — allowed by the strict CSP as-is. */}
        <Analytics />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
