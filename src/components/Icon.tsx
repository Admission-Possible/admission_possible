import type { ReactNode } from 'react';
import type { IconName } from '../types';

const PATHS: Record<IconName, ReactNode> = {
  route: (
    <>
      <path d="M5 19 19 5M5 5h14v14" />
      <path d="M5 12v7h7" />
    </>
  ),
  coaching: (
    <>
      <path d="M4 4h16v12H9l-5 4V4Z" />
      <path d="M8 8h8M8 12h5" />
    </>
  ),
  course: (
    <>
      <path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3V4Z" />
      <path d="M12 6v15" />
    </>
  ),
  people: (
    <>
      <circle cx="8" cy="7" r="3" />
      <circle cx="17" cy="8" r="2" />
      <path d="M2 21v-3a6 6 0 0 1 12 0v3M17 13a5 5 0 0 1 5 5v3" />
    </>
  ),
  write: (
    <>
      <path d="m4 15 11-11 5 5L9 20H4v-5ZM12 7l5 5M4 20h16" />
    </>
  ),
  list: (
    <>
      <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
    </>
  ),
  submit: (
    <>
      <path d="m3 12 6 6L21 6" />
    </>
  ),
  apply: (
    <>
      <path d="M13 3H4v18h16v-9M13 3h8v8M21 3 10 14" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-5-6 5V3Z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M7 2v6M17 2v6M3 11h18M7 15h3M14 15h3" />
    </>
  ),
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <span className={`icon${className ? ' ' + className : ''}`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {PATHS[name]}
      </svg>
    </span>
  );
}
