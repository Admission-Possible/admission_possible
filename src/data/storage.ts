import type { Answers, Draft, Intake, School } from '../types';

// Storage helpers carrying intake state across the router -> plan -> dashboard flow.
//
// The completed intake lives in localStorage so the plan — the product's one
// real deliverable — survives a tab close, a new tab, and tomorrow's visit.
// sessionStorage is kept as a read fallback (so a plan saved by the previous
// build is not lost) and as a write fallback when localStorage is unavailable,
// which is what Safari private mode and some school-managed profiles do.
const STORE = 'ap.intake';

// The in-progress quiz is deliberately per-tab: it is scratch state, and two
// tabs answering different questions should not fight over one key. It only
// has to survive a refresh or an accidental gesture-back.
const DRAFT = 'ap.intake.draft';

/** Write to a store, reporting failure instead of throwing. */
function write(store: Storage | undefined, key: string, value: string): boolean {
  try {
    store?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Read from a store, treating any failure as "nothing there". */
function read(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function remove(store: Storage | undefined, key: string): void {
  try {
    store?.removeItem(key);
  } catch {
    // Storage unavailable: there is nothing to clear.
  }
}

// Accessing window.localStorage can itself throw when cookies are blocked, so
// every access goes through these guards rather than touching the global.
const local = (): Storage | undefined => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};
const session = (): Storage | undefined => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

// Returns false only when BOTH stores are unavailable, so callers can surface
// the failure instead of navigating into a plan page that will find nothing.
export function saveIntake(data: Intake): boolean {
  const raw = JSON.stringify(data);
  const durable = write(local(), STORE, raw);
  const fallback = write(session(), STORE, raw);
  return durable || fallback;
}

const TRACK_NAMES = ['Self-paced course', '1:1 Coaching'];

/** Every entry must be a real {name, tag} — `[null]` used to pass and crash the render. */
function isSchoolList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every((s) => typeof s === 'object' && s !== null && typeof (s as School).name === 'string')
  );
}

// Narrow an unknown parsed value to a valid Intake. Guards against a corrupt or
// tampered-with payload reaching the pages, where a `.map` over a bad element
// would crash the render — costing the student their plan by way of the
// ErrorBoundary.
function isValidIntake(value: unknown): value is Intake {
  if (typeof value !== 'object' || value === null) return false;
  const plan = (value as { plan?: unknown }).plan;
  if (typeof plan !== 'object' || plan === null) return false;
  const p = plan as Record<string, unknown>;
  const override = (value as { trackOverride?: unknown }).trackOverride;
  // An arbitrary trackOverride used to flow straight through the track
  // ternaries on Plan and Dashboard.
  if (override !== undefined && !TRACK_NAMES.includes(override as string)) return false;
  return (
    isSchoolList(p.reach) &&
    isSchoolList(p.target) &&
    isSchoolList(p.likely) &&
    typeof p.pathway === 'string' &&
    typeof p.why === 'string'
  );
}

function parseIntake(raw: string | null): Intake | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidIntake(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadIntake(): Intake | null {
  // localStorage wins; sessionStorage is the migration/fallback path.
  return parseIntake(read(local(), STORE)) ?? parseIntake(read(session(), STORE));
}

export function clearIntake(): void {
  remove(local(), STORE);
  remove(session(), STORE);
}

/** Cheap existence check for nav ("My plan" appears only once a plan exists). */
export function hasIntake(): boolean {
  return loadIntake() !== null;
}

function isValidDraft(value: unknown): value is Draft {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Record<string, unknown>;
  return typeof d.step === 'number' && Number.isFinite(d.step) && typeof d.answers === 'object' && d.answers !== null;
}

/** Persist mid-quiz progress so a refresh or gesture-back doesn't wipe answers. */
export function saveDraft(step: number, answers: Answers): void {
  write(session(), DRAFT, JSON.stringify({ step, answers }));
}

export function loadDraft(): Draft | null {
  const raw = read(session(), DRAFT);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  remove(session(), DRAFT);
}
