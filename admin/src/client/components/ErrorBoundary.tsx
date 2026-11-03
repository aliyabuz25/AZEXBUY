import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Octotech ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 text-slate-900 select-none">
          <div className="max-w-md w-full p-6 bg-white border border-slate-300 shadow-lg space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Sistem Bərpa Rejimi
                </h2>
                <p className="text-xs text-slate-500">
                  Gözlənilməz interfeys istisnası qeydə alındı
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Naməlum xəta'}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>İnterfeysi Yenilə</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
