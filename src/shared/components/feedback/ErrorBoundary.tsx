import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { FiAlertOctagon, FiRefreshCw } from 'react-icons/fi';

interface ErrorBoundaryProps {
  fallbackTitle?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Aislamiento de fallos por panel (HU-F15):
 * Garantiza que un error de renderizado en un bloque (Matriz, Visor PDF o Chat)
 * jamás deje en blanco toda la pantalla.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Fallo inesperado al renderizar este módulo.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary Panel Isolation]:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="bg-white border border-red-200 rounded-xl p-6 text-center my-2 flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <FiAlertOctagon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {this.props.fallbackTitle || 'Interrupción aislada en este panel'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            El resto de su espacio de trabajo permanece activo y protegido. Puede recargar este componente sin perder su sesión.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-hover transition-colors"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar carga del panel</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

