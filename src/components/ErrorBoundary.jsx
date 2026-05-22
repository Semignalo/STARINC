import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-6">
              Aplikasi mengalami kesalahan yang tidak terduga. Silakan muat ulang halaman.
            </p>
            <details className="mb-6 text-left bg-gray-100 p-3 rounded text-sm text-gray-700 max-h-32 overflow-auto">
              <summary className="cursor-pointer font-mono font-semibold">Detail Error</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
