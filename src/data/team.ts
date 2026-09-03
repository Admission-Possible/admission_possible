export interface TeamMember {
  slug: string;
  name: string;
  /** Full name as shown in the team directory. */
  fullName: string;
  /** Directory role chips (Founding Team, Technical, …). */
  roles: string[];
  /** Card portrait (15:11 landscape). */
  photo: string;
  /** Wide hero image on the profile page. */
  storyPhoto: string;
  /** Resting tilt of the directory card on the About page. */
  tilt: number;
  /** Short journey line, e.g. "Architecture → Brand → Web → AI". */
  path: string;
  /** Middle-column narrative. */
  bio: string;
  /** Right-column bold statement. */
  belief: string;
  /** Muted sub-paragraph under the statement. */
  beliefSub: string;
  /** Pastel pill tags. */
  tags: string[];
}

// Filler content. Swap for real bios/photos when ready.
export const TEAM: TeamMember[] = [
  {
    slug: 'jose',
    name: 'Jose',
    fullName: 'Jose Cruz',
    roles: ['Founding Team', 'Technical', 'Outreach', 'Marketing'],
    photo: '/team/jose.webp',
    storyPhoto: '/team/jose-story.webp',
    tilt: -6,
    path: 'First-gen → CS → Mentor → Founder',
    bio: "I grew up as the translator in my family, for forms, for phone calls, for the systems nobody explained to us. I taught myself to code, talked my way into rooms I wasn't supposed to be in, and built the map I wish I'd had at seventeen.",
    belief:
      'I believe no one should need a connected family to get a fair shot. The application is a system, and systems can be learned, taught, and shared.',
    beliefSub:
      'I build the product the way I wish someone had walked me through it: patiently, in plain language, with the receipts. The plan is yours. We just hand you the map.',
    tags: ['Product', 'Engineering', 'First-gen advocacy', 'Essay strategy', 'Mentorship', 'Systems design'],
  },
  {
    slug: 'hoalin',
    name: 'Haolin',
    fullName: 'Haolin Feng',
    roles: ['Founding Team', 'Operational', 'Counseling', 'Marketing'],
    photo: '/team/hoalin.svg',
    storyPhoto: '/team/hoalin-story.svg',
    tilt: 5,
    path: 'Public school → Berkeley → Builder',
    bio: "I came up through overcrowded classrooms and a counselor who had four hundred other students. Everything I learned about applying, I learned too late or by accident. I'm here so the next kid learns it on time.",
    belief:
      'I believe access is a design problem, not a talent problem. Talent is everywhere. The instructions are not.',
    beliefSub:
      'My job is to turn the chaos of deadlines, portals, and fine print into something that feels calm and doable, one clear step at a time.',
    tags: ['Operations', 'Financial aid', 'Outreach', 'Curriculum', 'Community', 'Coaching'],
  },
  {
    slug: 'angeline',
    name: 'Angeline',
    fullName: 'Angeline Martinez',
    roles: ['Founding Team', 'Operational', 'Counseling'],
    photo: '/team/angeline.svg',
    storyPhoto: '/team/angeline-story.svg',
    tilt: -3,
    path: 'Immigrant household → Art school → Storytelling',
    bio: "I was the first in my family to write a personal statement, and I had no idea what 'show, don't tell' even meant. I fell in love with helping people find the line in their story that makes an admissions officer lean in.",
    belief: 'I believe every student already has the essay inside them. They just need someone to help them hear it.',
    beliefSub:
      "I care about the small things, the verb, the detail, the ending, because that's where a real voice lives. Your story stays yours. I just help it land.",
    tags: ['Essays', 'Storytelling', 'Brand & voice', 'Workshops', 'Editing', 'Design'],
  },
  {
    slug: 'rehan',
    name: 'Rehan',
    fullName: 'Rehan Sha',
    photo: '/team/rehan.svg',
    storyPhoto: '/team/rehan-story.svg',
    tilt: 4,
    path: 'First-gen → Engineering → Mentor',
    bio: 'I learned the application process the hard way — by getting it wrong first and fixing it alone. Now I build the tools and sit with students one-on-one so nobody has to figure it out by trial and error like I did.',
    belief:
      'I believe the right guidance at the right moment changes the whole trajectory, and it should never depend on luck.',
    beliefSub:
      'I work where the product meets the person: the checklists, the reminders, the quiet coaching call the week a deadline feels impossible.',
    tags: ['Engineering', 'Coaching', 'College lists', 'Deadlines', 'Mentorship', 'First-gen advocacy'],
    roles: ['Founding Team', 'Technical', 'Counseling'],
  },
];

export function getMember(slug: string | undefined): TeamMember | undefined {
  return TEAM.find((m) => m.slug === slug);
}
