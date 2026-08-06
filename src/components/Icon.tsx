import type { CSSProperties, ReactNode } from 'react';
import type { IconName } from '../types';

// Two icon sources: inline freehand SVG paths (PATHS) and supplied PNGs
// (PNG_ICONS, which takes precedence). Names not in either render nothing.

const svgProps = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Remaining inline freehand icons (the rest are PNGs below).
const PATHS: Partial<Record<IconName, ReactNode>> = {
  bookmark: <path d="M14 6h20c.6 0 1 .5 1 1v35l-11-9-11 9V7c0-.5.4-1 1-1z" />,
  calendar: (
    <>
      <path d="M9 12h30c.6 0 1 .5 1 1v26c0 .6-.5 1-1 1H9c-.6 0-1-.4-1-1V13c0-.5.5-1 1-1z" />
      <path d="M8 20h32" />
      <path d="M16 8v8" />
      <path d="M32 8v8" />
      <path d="M16 28h5" />
      <path d="M27 28h5" />
      <path d="M16 34h5" />
    </>
  ),
};

// Icons supplied as PNGs instead of inline SVG paths (take precedence).
const PNG_ICONS: Partial<Record<IconName, string>> = {
  route: '/icons/route.png',
  coaching: '/icons/coaching.png',
  course: '/icons/course.png',
  people: '/icons/people.png',
  write: '/icons/learn-write.png',
  list: '/icons/list.png',
  submit: '/icons/submit.png',
  apply: '/icons/apply.png',
};

interface IconProps {
  name: IconName;
  /** Wrapper class that sets --icon-size and margins (e.g. step-icon, row-icon). */
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const cls = `icon${className ? ' ' + className : ''}`;
  const png = PNG_ICONS[name];
  if (png) {
    return (
      <span className={cls} aria-hidden="true">
        <img className="icon-img" src={png} alt="" />
      </span>
    );
  }
  return (
    <span className={cls} aria-hidden="true">
      <svg {...svgProps} style={{ width: 'var(--icon-size, 30px)', height: 'var(--icon-size, 30px)' } as CSSProperties}>
        {PATHS[name]}
      </svg>
    </span>
  );
}
