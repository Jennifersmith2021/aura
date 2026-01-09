"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs bg-black/20 p-3 rounded overflow-auto max-h-48">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
