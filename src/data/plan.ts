import type { Answers, Plan, School, TrackName } from '../types';

// Map intake answers to a pathway, a starter list, and a track.
// Pathway branching is ported logic-for-logic from the legacy computePlan();
// the starter list is picked from a catalog using region, college-preference,
// and GPA answers instead of the legacy static lists.

type RegionName = 'Northeast' | 'South' | 'Midwest' | 'West';
type Kind = 'Large public' | 'Small liberal arts' | 'Highly selective' | 'HBCU / HSI' | 'In-state / commuter';
type System = 'UC App' | 'Cal State Apply' | 'ApplyTexas';

interface CatalogSchool extends School {
  region: RegionName;
  kinds: Kind[];
  /** Reach entries for the top GPA band only. */
  top?: boolean;
  /** Non-Common-App application system; only offered when its region is explicitly picked. */
  system?: System;
}

const REGION_ORDER: RegionName[] = ['Northeast', 'South', 'Midwest', 'West'];

// One starter catalog per bucket, grouped by region. Tags state each school's
// application system and aid angle without presuming residency.
const CATALOG: Record<'reach' | 'target' | 'likely', CatalogSchool[]> = {
  reach: [
    {
      name: 'Amherst College',
      tag: 'Common App · no-loan aid',
      region: 'Northeast',
      kinds: ['Small liberal arts', 'Highly selective'],
      top: true,
    },
    {
      name: 'Brown University',
      tag: 'Common App · QuestBridge partner',
      region: 'Northeast',
      kinds: ['Highly selective'],
      top: true,
    },
    { name: 'Boston University', tag: 'Common App · merit + need', region: 'Northeast', kinds: [] },
    { name: 'Northeastern University', tag: 'Common App · co-op powered', region: 'Northeast', kinds: [] },
    { name: 'Villanova University', tag: 'Common App · merit', region: 'Northeast', kinds: [] },
    {
      name: 'Rice University',
      tag: 'Common App · strong aid',
      region: 'South',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'Duke University',
      tag: 'Common App · QuestBridge partner',
      region: 'South',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'Emory University',
      tag: 'Common App · meets full need',
      region: 'South',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'Spelman College',
      tag: "Common App · HBCU · women's college",
      region: 'South',
      kinds: ['HBCU / HSI', 'Small liberal arts'],
    },
    { name: 'Tulane University', tag: 'Common App · merit', region: 'South', kinds: [] },
    { name: 'University of Miami', tag: 'Common App · merit', region: 'South', kinds: [] },
    {
      name: 'Northwestern University',
      tag: 'Common App · QuestBridge partner',
      region: 'Midwest',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'University of Chicago',
      tag: 'Common App · no-loan aid',
      region: 'Midwest',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'Carleton College',
      tag: 'Common App · small liberal arts',
      region: 'Midwest',
      kinds: ['Small liberal arts', 'Highly selective'],
      top: true,
    },
    {
      name: 'University of Michigan',
      tag: 'Common App · Big Ten flagship',
      region: 'Midwest',
      kinds: ['Large public'],
    },
    { name: 'Case Western Reserve', tag: 'Common App · merit', region: 'Midwest', kinds: [] },
    { name: 'Marquette University', tag: 'Common App · merit', region: 'Midwest', kinds: [] },
    {
      name: 'Stanford University',
      tag: 'Common App · QuestBridge partner',
      region: 'West',
      kinds: ['Highly selective'],
      top: true,
    },
    {
      name: 'Pomona College',
      tag: 'Common App · no-loan aid',
      region: 'West',
      kinds: ['Small liberal arts', 'Highly selective'],
      top: true,
    },
    {
      name: 'UCLA',
      tag: 'UC App · strong aid',
      region: 'West',
      kinds: ['Large public', 'Highly selective'],
      top: true,
      system: 'UC App',
    },
    { name: 'UC San Diego', tag: 'UC App · strong aid', region: 'West', kinds: ['Large public'], system: 'UC App' },
    {
      name: 'UC Irvine',
      tag: 'UC App · Hispanic-Serving',
      region: 'West',
      kinds: ['Large public', 'HBCU / HSI'],
      system: 'UC App',
    },
    { name: 'University of Oregon', tag: 'Common App · merit', region: 'West', kinds: ['Large public'] },
  ],
  target: [
    { name: 'Fordham University', tag: 'Common App · merit + need', region: 'Northeast', kinds: [] },
    { name: 'Syracuse University', tag: 'Common App · merit', region: 'Northeast', kinds: [] },
    {
      name: 'Rutgers University–New Brunswick',
      tag: 'Common App · strong value',
      region: 'Northeast',
      kinds: ['Large public'],
    },
    { name: 'Howard University', tag: 'Common App · HBCU', region: 'South', kinds: ['HBCU / HSI'] },
    { name: 'Florida State University', tag: 'Common App · low cost', region: 'South', kinds: ['Large public'] },
    { name: 'University of South Carolina', tag: 'Common App · merit', region: 'South', kinds: ['Large public'] },
    { name: 'Ohio State University', tag: 'Common App · large public', region: 'Midwest', kinds: ['Large public'] },
    { name: 'Michigan State University', tag: 'Common App · merit', region: 'Midwest', kinds: ['Large public'] },
    {
      name: 'DePaul University',
      tag: 'Common App · commuter friendly',
      region: 'Midwest',
      kinds: ['In-state / commuter'],
    },
    { name: 'UC Davis', tag: 'UC App · strong aid', region: 'West', kinds: ['Large public'], system: 'UC App' },
    { name: 'Santa Clara University', tag: 'Common App · merit', region: 'West', kinds: [] },
    { name: 'Arizona State University', tag: 'Common App · big merit', region: 'West', kinds: ['Large public'] },
  ],
  likely: [
    {
      name: 'Temple University',
      tag: 'Common App · affordable',
      region: 'Northeast',
      kinds: ['Large public', 'In-state / commuter'],
    },
    { name: 'University at Buffalo', tag: 'Common App · low cost', region: 'Northeast', kinds: ['Large public'] },
    {
      name: 'Seton Hall University',
      tag: 'Common App · merit likely',
      region: 'Northeast',
      kinds: ['In-state / commuter'],
    },
    { name: 'Xavier University of Louisiana', tag: 'Common App · HBCU', region: 'South', kinds: ['HBCU / HSI'] },
    {
      name: 'University of Central Florida',
      tag: 'Common App · affordable',
      region: 'South',
      kinds: ['Large public', 'In-state / commuter'],
    },
    {
      name: 'UT Arlington',
      tag: 'ApplyTexas · affordable',
      region: 'South',
      kinds: ['Large public', 'In-state / commuter'],
      system: 'ApplyTexas',
    },
    {
      name: 'University of Minnesota Twin Cities',
      tag: 'Common App · affordable',
      region: 'Midwest',
      kinds: ['Large public'],
    },
    { name: 'University of Iowa', tag: 'Common App · value', region: 'Midwest', kinds: ['Large public'] },
    {
      name: 'Kent State University',
      tag: 'Common App · merit likely',
      region: 'Midwest',
      kinds: ['In-state / commuter'],
    },
    {
      name: 'Cal State Fullerton',
      tag: 'Cal State Apply · low cost',
      region: 'West',
      kinds: ['Large public', 'In-state / commuter', 'HBCU / HSI'],
      system: 'Cal State Apply',
    },
    { name: 'University of Nevada, Reno', tag: 'Common App · affordable', region: 'West', kinds: ['Large public'] },
    { name: 'Gonzaga University', tag: 'Common App · merit likely', region: 'West', kinds: [] },
  ],
};

const isRegionName = (r: string): r is RegionName => (REGION_ORDER as string[]).indexOf(r) >= 0;

// System-specific applications are only worth a slot when the student
// actually picked that system's region ("Anywhere" is not enough — a
// Northeast student shouldn't be sent to Cal State Apply).
function systemAllowed(system: System, picked: RegionName[]): boolean {
  if (system === 'ApplyTexas') return picked.indexOf('South') >= 0;
  return picked.indexOf('West') >= 0; // UC App, Cal State Apply
}

// Returns catalog entries, not bare Schools: computePlan needs each pick's
// application system to build the deadline list.
function pickSchools(
  bucket: 'reach' | 'target' | 'likely',
  picked: RegionName[],
  kinds: string[],
  gpaTop: boolean,
): CatalogSchool[] {
  const pool = CATALOG[bucket].filter((s) => {
    if (bucket === 'reach' && s.top && !gpaTop) return false;
    if (s.system && !systemAllowed(s.system, picked)) return false;
    return true;
  });

  // Rank: top-band reaches first (when unlocked), then preference matches,
  // then interleave regions by each school's rank within its region so a
  // no-region list isn't three schools from the same corner of the map.
  const rankInRegion = new Map<CatalogSchool, number>();
  const seen: Record<string, number> = {};
  for (const s of CATALOG[bucket]) {
    rankInRegion.set(s, (seen[s.region] = (seen[s.region] ?? 0) + 1));
  }
  const overlap = (s: CatalogSchool) => s.kinds.filter((k) => kinds.indexOf(k) >= 0).length;
  const key = (s: CatalogSchool): number[] => [
    s.top ? 0 : 1,
    -overlap(s),
    rankInRegion.get(s) ?? 99,
    REGION_ORDER.indexOf(s.region),
  ];
  const byKey = (a: CatalogSchool, b: CatalogSchool) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return 0;
  };

  const sorted = [...pool].sort(byKey);
  const regional = picked.length ? sorted.filter((s) => picked.indexOf(s.region) >= 0) : sorted;
  const chosen = regional.slice(0, 3);
  for (const s of sorted) {
    if (chosen.length >= 3) break;
    if (chosen.indexOf(s) < 0) chosen.push(s);
  }
  return chosen;
}

/** Every school's tag begins with its application system, e.g. "UC App · ...". */
const systemFromTag = (tag: string) => tag.split('·')[0].trim();

/**
 * The application systems a student actually has to file, derived from the
 * schools on their list.
 *
 * Plans saved before this field existed fall back to parsing the tags, so a
 * returning student still gets the right deadlines instead of an empty panel.
 */
export function planSystems(plan: Plan): string[] {
  if (plan.systems?.length) return plan.systems;
  const all = [...plan.reach, ...plan.target, ...plan.likely].map((s) => systemFromTag(s.tag));
  return [...new Set(all)];
}

/**
 * What this student should actually be doing right now.
 *
 * Question 1 asks for grade and nothing consumed it: a 9th grader was handed
 * the same "apply this fall" deadline pressure as a senior. This is the answer
 * finally reaching the output.
 */
export function timelineFor(grade: string): string {
  switch (grade) {
    case '9th grade':
    case '10th grade':
      return "You're early, and that's an advantage. These deadlines aren't yours yet — use the time to build the grades, rigor and activities the application will ask about.";
    case '11th grade':
      return "This is the build year. The deadlines below are next fall's, so treat them as your target: draft essays over the summer and you will not be scrambling.";
    case 'Gap year':
      return "Applying during a gap year is common and works. These are this cycle's deadlines, and what you are doing with the year is legitimate material for the essays.";
    case '12th grade':
      return 'This is your cycle. The deadlines below are the real ones — work backwards from the earliest.';
    default:
      return 'Deadlines shift every year, so confirm each one on the official site.';
  }
}

export function computePlan(answers: Answers): Plan {
  const a = answers ?? {};
  const firstgen = a.firstgen === 'Yes';
  const pellish = a.pell === 'Yes' || a.pell === 'Not sure';
  const gpaTop = typeof a.gpa === 'string' && a.gpa.indexOf('3.8') === 0;
  const regions = (a.regions as string[]) ?? [];
  const colleges = (a.colleges as string[]) ?? [];
  const grade = typeof a.grade === 'string' ? a.grade : '';
  const wantsHbcu = colleges.indexOf('HBCU / HSI') >= 0;

  let pathway: string;
  let why: string;

  if (firstgen && pellish && gpaTop) {
    pathway = 'QuestBridge + Common App';
    why =
      'Your profile fits the National Match. Pair it with Common App so you keep every door open while you wait on Match results.';
  } else if (regions.indexOf('West') >= 0) {
    pathway = 'UC Application + Common App';
    why = 'The UC system needs its own application and essays. Common App covers everything else in one place.';
  } else if (wantsHbcu) {
    pathway = 'CBCA + Common App';
    why = 'One CBCA application reaches dozens of HBCUs. Common App opens up the rest of your list.';
  } else if (regions.indexOf('South') >= 0 && colleges.indexOf('Large public') >= 0) {
    pathway = 'ApplyTexas + Common App';
    why = 'Texas publics run through ApplyTexas. Common App handles your out-of-state and private picks.';
  } else {
    pathway = 'Common App';
    why = 'One essay, a thousand-plus schools. The widest, simplest front door for the list you described.';
  }

  // The branch chain is first-match, so QuestBridge and UC used to shadow the
  // HBCU/HSI answer entirely: a student who said they were drawn to HBCUs got a
  // plan that never mentioned it, and never heard about CBCA — the single-app,
  // low-fee route built for exactly them. Make the signal additive instead.
  if (wantsHbcu && pathway.indexOf('CBCA') < 0) {
    pathway = `${pathway} + CBCA`;
    why += ' You said HBCUs and HSIs draw you, so add CBCA — one application reaches dozens of them for a low fee.';
  }

  const picked = regions.filter(isRegionName);
  const reach = pickSchools('reach', picked, colleges, gpaTop);
  const target = pickSchools('target', picked, colleges, gpaTop);
  const likely = pickSchools('likely', picked, colleges, gpaTop);

  // Systems the student actually has to file, taken from the schools they were
  // given rather than from the pathway label. The label is one first-match
  // string and routinely omits a system sitting on the list.
  const systems = [...new Set([...reach, ...target, ...likely].map((s) => systemFromTag(s.tag)))];
  if (pathway.indexOf('QuestBridge') >= 0) systems.push('QuestBridge');
  if (pathway.indexOf('CBCA') >= 0) systems.push('CBCA');

  // 'Not sure yet' is a real answer, not self-paced. We still have to start
  // somewhere, so record that the choice was not made and let the plan say so.
  const trackChosen = a.track === 'With a coach' || a.track === 'Self-paced';
  const trackName: TrackName = a.track === 'With a coach' ? '1:1 Coaching' : 'Self-paced course';

  const strip = (s: School[]) => s.map(({ name, tag }) => ({ name, tag }));

  return {
    pathway,
    why,
    reach: strip(reach),
    target: strip(target),
    likely: strip(likely),
    trackName,
    trackChosen,
    systems: [...new Set(systems)],
    grade,
    timeline: timelineFor(grade),
  };
}
