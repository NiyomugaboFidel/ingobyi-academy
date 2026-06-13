'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { PageError } from './page-error';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallbackTitle?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <PageError
          title={this.props.fallbackTitle ?? 'Something went wrong'}
          message={this.state.error.message || 'An unexpected error occurred in this section.'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
