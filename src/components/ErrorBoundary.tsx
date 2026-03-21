import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-default)] shadow-2xl m-4">
          <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6 border border-[var(--status-error)] text-[var(--status-error)]">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter italic">Industrial Failure</h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest leading-loose max-w-[240px] mb-8">
            The system encountered a structural anomaly. Local data may be corrupted or inaccessible.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-premium !h-12 px-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(212,255,0,0.1)] active:scale-95 transition-all"
          >
            <RefreshCcw size={14} strokeWidth={3} /> Re-initialize
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
