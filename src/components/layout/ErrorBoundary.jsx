import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg-gradient)' }}>
          <div className="glass-card-elevated max-w-md w-full p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-danger-light)' }}>
                <AlertTriangle className="w-8 h-8 text-[var(--color-danger)]" aria-hidden="true" />
              </div>
            </div>

            <h1 className="font-heading font-bold text-xl text-[var(--color-text-primary)] mb-2">
              Something went wrong
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
            </p>

            <button
              onClick={this.handleReload}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
