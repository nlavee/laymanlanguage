"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 shadow-lg w-full my-4">
            <AlertTriangle className="text-red-400 shrink-0" size={32} />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Interactive Component Error</h3>
              <p className="text-red-400/80 text-sm">
                 An unexpected rendering error occurred. Check browser console for stack traces.
              </p>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
