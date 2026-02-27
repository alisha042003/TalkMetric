import React from 'react';
import { AlertTriangle, RefreshCw, Home, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console
    console.error("Dashboard error:", error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Send error to analytics if available
    this.logErrorToAnalytics(error, errorInfo);
  }

  logErrorToAnalytics = (error, errorInfo) => {
    try {
      // Only send in production
      if (process.env.NODE_ENV === 'production') {
        // You can replace this with your actual analytics endpoint
        fetch('https://api.talkmetric.com/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error?.toString(),
            componentStack: errorInfo?.componentStack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          })
        }).catch(e => console.log('Analytics log failed:', e));
      }
    } catch (e) {
      // Silent fail for analytics
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { fallbackUI, children } = this.props;

    if (hasError) {
      // If a custom fallback UI is provided, use it
      if (fallbackUI) {
        return fallbackUI;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 sm:p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Dashboard Error</h2>
                  <p className="text-sm text-white/80 mt-1">Something went wrong</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">Component Failed to Load</p>
                  <p className="text-sm text-gray-500 mt-1">
                    The dashboard component encountered an unexpected error and could not render properly.
                  </p>
                </div>
              </div>

              {/* Error Details Section (only in development) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={this.toggleDetails}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">Error Details</span>
                    {showDetails ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {showDetails && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 overflow-auto max-h-60">
                      <p className="text-xs font-mono text-red-600 whitespace-pre-wrap break-all">
                        {error.toString()}
                      </p>
                      {errorInfo?.componentStack && (
                        <details className="mt-3">
                          <summary className="text-xs text-gray-500 cursor-pointer">Component Stack</summary>
                          <pre className="mt-2 text-xs font-mono text-gray-600 whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Fix Suggestions */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-2">Try these quick fixes:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Refresh the page to reload the component</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all"
                >
                  <Home size={16} className="mr-2" />
                  Go to Home
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  If this problem persists, please contact support at{' '}
                  <a href="mailto:support@talkmetric.com" className="text-indigo-600 hover:underline">
                    support@talkmetric.com
                  </a>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Error ID: {error ? Math.random().toString(36).substring(7) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component wrapper for easy usage
export const withErrorBoundary = (Component, fallbackUI = null) => {
  const WithErrorBoundary = (props) => (
    <ErrorBoundary fallbackUI={fallbackUI}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
};

// Pre-configured error boundaries for specific components
export const DashboardErrorBoundary = ({ children }) => (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
);

export const ChartErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallbackUI={
      <div className="p-8 bg-yellow-50 rounded-2xl text-center">
        <AlertTriangle size={32} className="mx-auto text-yellow-500 mb-3" />
        <h3 className="text-sm font-medium text-yellow-800">Chart Unavailable</h3>
        <p className="text-xs text-yellow-600 mt-1">Unable to load chart data</p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const DataErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallbackUI={
      <div className="p-6 bg-gray-50 rounded-2xl text-center">
        <AlertCircle size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Data temporarily unavailable</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-700"
        >
          Try again
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;