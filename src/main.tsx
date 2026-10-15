import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Global error telemetry to help diagnose unhandled browser crashes
window.addEventListener('error', (event) => {
  console.error('[TTF 2026 Global Window Error]:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[TTF 2026 Unhandled Promise Rejection]:', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[TTF 2026 Fatal]: #root container element missing from document body.');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
