import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] px-6 text-center">
          <span className="material-symbols-outlined text-4xl text-txt-secondary mb-3">error</span>
          <p className="text-txt font-semibold mb-1">Something went wrong</p>
          <p className="text-txt-secondary text-sm">Try refreshing the app.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
