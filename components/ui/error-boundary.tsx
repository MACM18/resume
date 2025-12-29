"use client";
import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center px-6'>
          <GlassCard variant='gradient' className='p-8 max-w-lg text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='p-4 rounded-full bg-destructive/20 border border-destructive/30'>
                <AlertTriangle className='text-destructive' size={32} />
              </div>
            </div>
            <h2 className='text-2xl font-bold mb-4 text-foreground'>
              Something went wrong
            </h2>
            <p className='text-foreground/70 mb-6 leading-relaxed'>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </p>
            {this.state.error && (
              <pre className='text-xs text-left bg-background/50 p-4 rounded-lg mb-6 overflow-auto max-h-32'>
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className='bg-primary hover:bg-primary/90'
            >
              Refresh Page
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
