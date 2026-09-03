import type { Plan, School, TrackName } from '../types';

/** The plan as plain text, so it can leave the tab via clipboard or download. */
export function planToText(plan: Plan, track: TrackName): string {
  const col = (title: string, list: School[]) =>
    [`${title}:`, ...(list.length ? list.map((s) => `  - ${s.name} (${s.tag})`) : ['  (none)'])].join('\n');

  return [
    '(Ad)mission Possible — my plan',
    '',
    'A — Your pathway',
    plan.pathway,
    plan.why,
    '',
    'B — Your starter list',
    col('Reach', plan.reach),
    col('Target', plan.target),
    col('Likely', plan.likely),
    '',
    'C — Your track',
    track,
    '',
    'Deadlines shift every year — confirm each on the official site.',
  ].join('\n');
}
