import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--dark-bg)',
            color: 'white'
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '40px',
              background: 'rgba(10, 10, 20, 0.9)',
              border: '2px solid var(--neon-pink)',
              borderRadius: '16px',
              boxShadow: '0 0 40px rgba(255, 0, 110, 0.3)'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                background: 'rgba(255, 0, 110, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--neon-pink)'
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--neon-pink)"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '28px',
                marginBottom: '16px',
                fontFamily: 'Orbitron, sans-serif',
                color: 'var(--neon-pink)'
              }}
            >
              Что-то пошло не так
            </h1>

            <p
              style={{
                fontSize: '16px',
                opacity: 0.8,
                marginBottom: '30px',
                lineHeight: '1.6'
              }}
            >
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу или вернуться на главную.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'Orbitron, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  background: 'transparent',
                  border: '2px solid var(--neon-cyan)',
                  borderRadius: '8px',
                  color: 'var(--neon-cyan)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Перезагрузить
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'Orbitron, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  background: 'var(--neon-cyan)',
                  border: '2px solid var(--neon-cyan)',
                  borderRadius: '8px',
                  color: '#000',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
