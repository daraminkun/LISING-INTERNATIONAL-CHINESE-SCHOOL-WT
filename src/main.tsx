import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Automatically recover from stale cached JS chunks after redeployments on mobile/desktop browsers
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    try {
      const key = 'sms_chunk_reload_ts';
      const last = Number(sessionStorage.getItem(key) || '0');
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  });
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Application runtime error:', error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4">
            <h1 className="text-lg font-bold text-slate-900">
              សូមផ្ទុកទំព័រឡើងវិញ • 請重新整理頁面 • Please Reload
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              ប្រព័ន្ធបានធ្វើបច្ចុប្បន្នភាពទិន្នន័យថ្មី។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបើកដំណើរការឡើងវិញដោយសុវត្ថិភាព។
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              ផ្ទុកទំព័រឡើងវិញ / Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}

