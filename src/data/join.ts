// The Join us sign-up: what the form asks and what it sends. Kept here so the
// page, its tests and the copy-paste fallback agree on one shape.

export type JoinPayload = {
  first: string;
  last: string;
  email: string;
  grade: string;
  firstGen: string;
  interests: string[];
  needs: string;
};

export const GRADES = ['9th grade', '10th grade', '11th grade', '12th grade', 'Gap year', 'Other'];
export const FIRST_GEN_OPTIONS = ['Yes', 'No', 'Not sure'];
export const INTERESTS = [
  'Finding my direction',
  'Exploring my options',
  'Building my college list',
  'Writing my essays',
  'Applying and submitting',
  'Ongoing mentorship',
];
