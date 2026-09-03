import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearIntake } from '../data/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Catches render-time errors anywhere below it and shows an on-brand
// fallback instead of a blank screen. "Start over" clears the intake
// state so a corrupt session can't wedge the app on reload.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the error for debugging; keep the UI graceful.
    console.error('ErrorBoundary caught an error', error, info);
  }

  private handleStartOver = (): void => {
    // Was a hardcoded 'ap.intake', which silently stopped clearing the plan the
    // moment storage moved to localStorage. One exported source of truth now.
    clearIntake();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '6vw',
            textAlign: 'center',
            background: 'var(--bg)',
            color: 'var(--ink)',
          }}
        >
          <div
            style={{ fontFamily: 'var(--mono)', fontSize: '13px', textTransform: 'uppercase', color: 'var(--muted)' }}
          >
            Something broke
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 6vw, 44px)', margin: 0, maxWidth: '18ch' }}>
            We hit a snag on our end.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: 0, maxWidth: '42ch' }}>
            Your progress may not have saved. Let's start fresh — it only takes a moment.
          </p>
          <a
            href="/"
            onClick={this.handleStartOver}
            style={{
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '14px',
              color: '#fff',
              background: 'var(--accent)',
              padding: '12px 22px',
            }}
          >
            Start over
          </a>
        </main>
      );
    }

    return this.props.children;
  }
}
