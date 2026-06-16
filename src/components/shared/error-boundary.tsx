'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div
        role="alert"
        className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center"
      >
        <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred while rendering this view.'}
        </p>
        <Button className="mt-5" variant="outline" onClick={this.reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }
}
