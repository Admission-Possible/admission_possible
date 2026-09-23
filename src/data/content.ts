// Approved site copy, kept in one place so Home and the interior pages can't
// drift apart. Nothing here is invented: each block is either quoted from the
// revision brief or carried over from copy the site already published. Add to
// it only with approved wording.

/** The "What we offer" core message, verbatim from the revision brief. */
export const CORE_MESSAGE = {
  lead: 'Your future is more than a college acceptance letter.',
  body: [
    'Thus, we don’t just help you get into college. We help you build the path that gets you there.',
    'Because getting into college is a milestone, not the finish line.',
    'Our philosophy stays consistent: your path doesn’t have a deadline. Neither does our support.',
  ],
  /** The closing statement. Its last word, "possible", gets the emphasis. */
  close: ['Find your direction.', 'Carve your path.', 'We make it'],
};

/** What guided mentorship helps students do, from the revision brief. */
export const MENTORSHIP_GOALS = [
  'Identify their aspirations',
  'Explore their options',
  'Carve their own path',
  'Develop toward their goals',
  'Navigate educational opportunities',
  'Receive continued guidance and mentorship',
  'Ultimately work toward achieving their goals',
];

/**
 * The How It Works steps: the content provided for the existing How It Works
 * tab, word for word. Do not add steps, explanations or statistics here.
 */
export const HOW_STEPS: { title: string; points: string[] }[] = [
  {
    title: 'Route',
    points: ['Answer a few questions', 'Provide details about your background', 'We map your situation and your path'],
  },
  {
    title: 'Build your list',
    points: ['Designed just for YOU', 'College list selection', 'Balanced across preference and financials'],
  },
  {
    title: 'Learn & write',
    points: [
      'Produce-as-you-learn modules to turn your story into essays',
      'One-on-one peer coaching',
      'Online coach that tracks your progress',
    ],
  },
  {
    title: 'Apply',
    points: [
      'Through college selection, we route you to specific application portals: QuestBridge, UC, Common App, etc.',
    ],
  },
  {
    title: 'Submit',
    points: ['Organized list with deadlines, drafts, preparations, and the next step all in one calm place'],
  },
];

/**
 * The application systems students may use. `logo` is the official mark in
 * /public/pathways; it stays unset until an approved file is supplied, and the
 * name alone is shown meanwhile. Never substitute an unofficial drawing.
 */
export const APPLICATION_PATHWAYS: { slug: string; name: string; logo?: string }[] = [
  { slug: 'questbridge', name: 'QuestBridge' },
  { slug: 'common-app', name: 'Common App' },
  { slug: 'uc-application', name: 'UC Application' },
  { slug: 'coalition', name: 'Coalition' },
  { slug: 'applytexas', name: 'ApplyTexas' },
  { slug: 'cbca', name: 'CBCA' },
];

/** The identity line the site was founded on. */
export const FIRST_GEN_LINE = ['By first-gen students.', 'For the next ones.'];

/** Published mission statement, carried over from the current site. */
export const MISSION = ['Your dreams feel impossible on your own.', 'We are here to help make them possible.'];

/** Published "who we are" paragraph, carried over from the current site. */
export const ORIGIN =
  'We’re first-gen students who walked this road without a map — the forms, the essays, the deadlines nobody at home could explain.';
