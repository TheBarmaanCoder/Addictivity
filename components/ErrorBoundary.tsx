import React, { Component, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onBack?: () => void;
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
      const isNative = Capacitor.isNativePlatform();
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] px-6 text-center">
          <span className="material-symbols-outlined text-4xl text-subtitle mb-3">error</span>
          <p className="text-textPrimary font-semibold mb-1">Something went wrong</p>
          <p className="text-subtitle text-sm mb-4">
            {isNative ? 'Try going back or try again.' : 'Try refreshing the app or try again.'}
          </p>
          <div className="flex gap-3">
            {this.props.onBack && (
              <button
                onClick={this.props.onBack}
                className="px-4 py-2 bg-main text-textOnMain font-semibold rounded-xl active:opacity-80"
              >
                Go back
              </button>
            )}
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-interactive text-textOnMain font-semibold rounded-xl active:opacity-80"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
