import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Try to reload the page as a last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please check the console for more details.
            </p>
            
            <div className="mb-4 space-y-2">
              <details className="cursor-pointer">
                <summary className="text-sm text-gray-500 font-medium">Error Details</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
