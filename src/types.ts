// Shared domain types for (Ad)mission Possible.

export interface NavItem {
  id: string;
  label: string;
  path: string;
}

export interface Question {
  key: string;
  q: string;
  multi: boolean;
  options: string[];
}

export interface Pathway {
  name: string;
  bestFor: string;
  fact: string;
  money: string;
}

export interface School {
  name: string;
  tag: string;
}

export type TrackName = 'Self-paced course' | '1:1 Coaching';

export interface Plan {
  pathway: string;
  why: string;
  reach: School[];
  target: School[];
  likely: School[];
  trackName: TrackName;
}

/** Router answers: single-select stores a string, multi-select stores a string[]. */
export type Answers = Record<string, string | string[]>;

export interface Intake {
  answers: Answers;
  plan: Plan;
  trackOverride?: TrackName;
}

export interface Crumb {
  label: string;
  /** A link target; omit for the current page (rendered large). */
  to?: string;
}

export type IconName =
  'route' | 'write' | 'list' | 'apply' | 'submit' | 'course' | 'bookmark' | 'calendar' | 'coaching' | 'people';
