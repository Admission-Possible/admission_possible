import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';

type CircleSize = 'lg' | 'join' | 'router' | 'plan' | 'dash';

interface CircleProps {
  children: ReactNode;
  size?: CircleSize;
  /** Render as a router link. */
  to?: string;
  /** Render as a button. */
  onClick?: () => void;
  type?: 'button' | 'submit';
  /** Disable the button (ignored when rendered as a link). */
  disabled?: boolean;
  /** Add data-reveal so it fades in on scroll. */
  reveal?: boolean;
  style?: CSSProperties;
}

// The one and only primary action: a solid electric-blue circle.
export function Circle({ children, size = 'lg', to, onClick, type = 'button', disabled, reveal, style }: CircleProps) {
  const cls = `circle circle--${size}`;
  const revealAttr = reveal ? { 'data-reveal': '' } : {};

  if (to) {
    return (
      <Link className={cls} to={to} style={style} {...revealAttr}>
        {children}
      </Link>
    );
  }
  return (
    <button
      className={cls}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={style}
      {...revealAttr}
    >
      {children}
    </button>
  );
}
