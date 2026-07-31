import type { Intake } from '../types';

// sessionStorage helpers that carry intake state across the
// router -> plan -> dashboard flow (replaces the legacy ap.intake helpers).
const STORE = 'ap.intake';

// Returns false when storage is unavailable (e.g. blocked in private
// browsing) so callers can surface the failure instead of navigating
// into a plan page that will find nothing.
export function saveIntake(data: Intake): boolean {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// Narrow an unknown parsed value to a valid Intake. Guards against a
// corrupt or tampered-with sessionStorage payload reaching the pages,
// where a `.map` on a missing array would crash the render.
function isValidIntake(value: unknown): value is Intake {
  if (typeof value !== 'object' || value === null) return false;
  const plan = (value as { plan?: unknown }).plan;
  if (typeof plan !== 'object' || plan === null) return false;
  const p = plan as Record<string, unknown>;
  return (
    Array.isArray(p.reach) &&
    Array.isArray(p.target) &&
    Array.isArray(p.likely) &&
    typeof p.pathway === 'string' &&
    typeof p.why === 'string'
  );
}

export function loadIntake(): Intake | null {
  try {
    const raw = sessionStorage.getItem(STORE);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidIntake(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
