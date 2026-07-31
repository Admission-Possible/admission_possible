import { describe, it, expect } from 'vitest';
import { computePlan } from './plan';
import type { Answers } from '../types';

describe('computePlan', () => {
  it('routes a first-gen, aid-eligible, top-GPA profile to QuestBridge', () => {
    const answers: Answers = {
      firstgen: 'Yes',
      pell: 'Yes',
      gpa: '3.8–4.0, lots of rigor',
    };
    const plan = computePlan(answers);
    expect(plan.pathway).toBe('QuestBridge + Common App');
    expect(plan.why).toMatch(/National Match/);
  });

  it('counts "Not sure" on aid as aid-eligible for the QuestBridge branch', () => {
    const plan = computePlan({ firstgen: 'Yes', pell: 'Not sure', gpa: '3.8–4.0, lots of rigor' });
    expect(plan.pathway).toBe('QuestBridge + Common App');
  });

  it('routes a West-region applicant to the UC pathway', () => {
    const plan = computePlan({ regions: ['West'] });
    expect(plan.pathway).toBe('UC Application + Common App');
  });

  it('routes an HBCU/HSI applicant to CBCA', () => {
    const plan = computePlan({ colleges: ['HBCU / HSI'] });
    expect(plan.pathway).toBe('CBCA + Common App');
  });

  it('routes a Southern large-public applicant to ApplyTexas', () => {
    const plan = computePlan({ regions: ['South'], colleges: ['Large public'] });
    expect(plan.pathway).toBe('ApplyTexas + Common App');
  });

  it('falls back to Common App for an unremarkable profile', () => {
    const plan = computePlan({ grade: '10th grade' });
    expect(plan.pathway).toBe('Common App');
  });

  it('gives a stronger reach list when GPA is top-band', () => {
    const top = computePlan({ firstgen: 'Yes', pell: 'Yes', gpa: '3.8–4.0, lots of rigor' });
    expect(top.reach.map((s) => s.name)).toContain('Amherst College');

    const lower = computePlan({ gpa: '3.0–3.5' });
    expect(lower.reach.map((s) => s.name)).toContain('Boston University');
  });

  it('keeps California and Texas system schools out of a Northeast-only list', () => {
    const plan = computePlan({ regions: ['Northeast'] });
    const schools = [...plan.reach, ...plan.target, ...plan.likely];
    expect(schools.map((s) => s.name)).not.toContain('UC Davis');
    expect(schools.map((s) => s.name)).not.toContain('Cal State Fullerton');
    expect(schools.map((s) => s.name)).not.toContain('UT Arlington');
    expect(schools.map((s) => s.tag).join(' ')).not.toMatch(/UC App|ApplyTexas|Cal State/);
  });

  it('offers UC-system schools only when West is explicitly picked', () => {
    const west = computePlan({ regions: ['West'] });
    expect(west.target.map((s) => s.name)).toContain('UC Davis');

    const anywhere = computePlan({ regions: ['Anywhere'] });
    const tags = [...anywhere.reach, ...anywhere.target, ...anywhere.likely].map((s) => s.tag).join(' ');
    expect(tags).not.toMatch(/UC App|ApplyTexas|Cal State/);
  });

  it('regionalizes each bucket for a picked region', () => {
    const mw = computePlan({ regions: ['Midwest'] });
    const names = [...mw.reach, ...mw.target, ...mw.likely].map((s) => s.name);
    expect(mw.target.map((s) => s.name)).toContain('Ohio State University');
    expect(names).not.toContain('Boston University');
  });

  it('floats HBCU options for an HBCU/HSI-drawn student', () => {
    const plan = computePlan({ colleges: ['HBCU / HSI'] });
    expect(plan.reach.map((s) => s.name)).toContain('Spelman College');
    expect(plan.target.map((s) => s.name)).toContain('Howard University');
    expect(plan.likely.map((s) => s.name)).toContain('Xavier University of Louisiana');
  });

  it('always returns three schools in each bucket', () => {
    const plan = computePlan({});
    expect(plan.reach).toHaveLength(3);
    expect(plan.target).toHaveLength(3);
    expect(plan.likely).toHaveLength(3);
  });

  it('maps the track answer to a track name', () => {
    expect(computePlan({ track: 'With a coach' }).trackName).toBe('1:1 Coaching');
    expect(computePlan({ track: 'Self-paced' }).trackName).toBe('Self-paced course');
    expect(computePlan({}).trackName).toBe('Self-paced course');
  });

  it('tolerates empty answers without throwing', () => {
    expect(() => computePlan({} as Answers)).not.toThrow();
  });
});
