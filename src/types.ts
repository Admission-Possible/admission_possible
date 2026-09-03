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
  /**
   * Application systems actually present on the student's list, so deadlines
   * come from the schools rather than the single first-match pathway label.
   * Optional: plans saved before this field existed are still valid.
   */
  systems?: string[];
  /** False when the student answered 'Not sure yet' — the track is a default, not a choice. */
  trackChosen?: boolean;
  /** The intake's grade answer, carried through so later steps needn't re-ask. */
  grade?: string;
  /** Grade-appropriate framing for the deadline panel. */
  timeline?: string;
}

/** Router answers: single-select stores a string, multi-select stores a string[]. */
export type Answers = Record<string, string | string[]>;

export interface Intake {
  answers: Answers;
  plan: Plan;
  trackOverride?: TrackName;
}

/** In-progress intake, persisted per tab so a refresh doesn't discard answers. */
export interface Draft {
  step: number;
  answers: Answers;
}

export interface Crumb {
  label: string;
  /** A link target; omit for the current page (rendered large). */
  to?: string;
}

export type IconName =
  'route' | 'write' | 'list' | 'apply' | 'submit' | 'course' | 'bookmark' | 'calendar' | 'coaching' | 'people';
