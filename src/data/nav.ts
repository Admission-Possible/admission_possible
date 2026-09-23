import type { NavItem } from '../types';

// The one navigation set. Header, menu and footer all read from here, so no
// surface can offer a destination the others don't. Join is the primary
// action; the rest are informational.
export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About us', path: '/about' },
  { id: 'how', label: 'How it works', path: '/how' },
  { id: 'offer', label: 'What we offer', path: '/offer' },
  { id: 'join', label: 'Join us', path: '/join' },
];

/** The informational pages, without Home and the Join conversion. */
export const INFO_NAV = NAV.filter((n) => n.id !== 'home' && n.id !== 'join');

export const JOIN_NAV = NAV.find((n) => n.id === 'join')!;
