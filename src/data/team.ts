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
  /**
   * Short journey line, e.g. "Architecture → Brand → Web → AI".
   *
   * Every narrative field below is optional. A member with no approved copy
   * renders a plain "profile coming soon" state — the alternative was
   * publishing invented first-person testimony under a real person's name.
   */
  path?: string;
  /** Middle-column narrative. */
  bio?: string;
  /** Right-column bold statement. */
  belief?: string;
  /** Muted sub-paragraph under the statement. */
  beliefSub?: string;
  /** Pastel pill tags. */
  tags?: string[];
}

/** True once this member has approved copy to show. */
export function hasStory(member: TeamMember): boolean {
  return Boolean(member.bio && member.belief);
}

// Only Jose has approved copy and real photos.
//
// The other three previously shipped detailed first-person life stories and
// belief statements — including specific claims about their schooling — under
// their real full names, next to monogram placeholder portraits, on a page
// styled as personal testimony. None of it was theirs. It has been removed
// rather than left in place behind a "filler content" comment no visitor sees.
//
// To restore a profile: add real photos under public/team/, then fill in path,
// bio, belief, beliefSub and tags with copy that person has actually approved.
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
    slug: 'haolin',
    name: 'Haolin',
    fullName: 'Haolin Feng',
    roles: ['Founding Team', 'Operational', 'Counseling', 'Marketing'],
    photo: '/team/haolin.svg',
    storyPhoto: '/team/haolin-story.svg',
    tilt: 5,
  },
  {
    slug: 'angeline',
    name: 'Angeline',
    fullName: 'Angeline Martinez',
    roles: ['Founding Team', 'Operational', 'Counseling'],
    photo: '/team/angeline.svg',
    storyPhoto: '/team/angeline-story.svg',
    tilt: -3,
  },
  {
    slug: 'rehan',
    name: 'Rehan',
    fullName: 'Rehan Sha',
    photo: '/team/rehan.svg',
    storyPhoto: '/team/rehan-story.svg',
    tilt: 4,
    roles: ['Founding Team', 'Technical', 'Counseling'],
  },
];

export function getMember(slug: string | undefined): TeamMember | undefined {
  return TEAM.find((m) => m.slug === slug);
}
