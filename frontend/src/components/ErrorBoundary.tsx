import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import logger from '../utils/logger';
import { nanoid } from 'nanoid';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId?: string;
  traceId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
      errorId: nanoid(),
      traceId: nanoid(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught an error', error, {
      errorId: this.state.errorId,
      traceId: this.state.traceId,
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorStack: error.stack,
    });
  }

  handleRefresh = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-600">Oops, Something Went Wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600 space-y-4">
              <p>An unexpected error occurred. Please refresh the page.</p>

              <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded space-y-1">
                <div>
                  <span className="font-semibold">Error ID:</span> {this.state.errorId}
                </div>
                <div>
                  <span className="font-semibold">Trace ID:</span> {this.state.traceId}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={this.handleRefresh}>Refresh</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
