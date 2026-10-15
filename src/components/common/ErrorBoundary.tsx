import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TTF 2026 ErrorBoundary caught an exception]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F7FCFB] flex items-center justify-center p-4 selection:bg-[#03A695] selection:text-white font-sans">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header Icon & Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF3EC] border border-orange-200 flex items-center justify-center text-[#FD5E01] shrink-0 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FD5E01] block">
                  Techno Talent Feast 2026 • Runtime Guardian
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Application View Recovered
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A client-side state issue was prevented from blanking your screen.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left font-mono text-xs text-slate-700 overflow-x-auto max-h-40">
              <p className="font-bold text-red-600 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </p>
              {this.state.error?.stack && (
                <pre className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-2">
                  {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleResetStorage}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#03A695] text-white font-bold text-xs shadow-md hover:bg-[#028b7d] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear Stale Cache & Restore
              </button>
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Reload Page
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Dubai Grand Finale 2026 • Platform will automatically restore verified mock and Atlas database records.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
