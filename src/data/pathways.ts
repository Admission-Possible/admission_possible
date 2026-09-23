import type { Pathway } from '../types';

// Application systems shown in the Pathways table.
export const PATHWAYS: Pathway[] = [
  {
    name: 'Common App',
    bestFor: 'Most private + many public',
    fact: 'One essay, 1,000+ schools',
    money: 'Fee waivers available',
  },
  {
    name: 'UC Application',
    bestFor: 'All UC campuses',
    fact: 'Its own Personal Insight Qs, no separate supplements',
    // The money column previously held "No separate supplements", which is not
    // a cost fact. Left blank rather than asserting a fee policy we haven't
    // verified — the note under the table tells students where to check.
    money: '—',
  },
  {
    name: 'QuestBridge',
    bestFor: 'High-achieving, low-income',
    fact: 'National Match = possible full ride',
    money: 'Free to apply',
  },
  { name: 'Coalition', bestFor: 'Member schools', fact: 'Alternative to Common App', money: 'Fee waivers available' },
  { name: 'ApplyTexas', bestFor: 'Texas publics', fact: 'Standard Texas route, its own essays', money: '—' },
  { name: 'CBCA', bestFor: 'HBCUs', fact: 'One app, many schools', money: 'One low fee' },
];
