import { describe, it, expect } from 'vitest';
import { computePlan, planSystems, timelineFor } from './plan';
import type { Answers } from '../types';

const QB: Answers = { firstgen: 'Yes', pell: 'Yes', gpa: '3.8–4.0, lots of rigor' };

describe('deadline systems derive from the list, not the pathway label', () => {
  // #35: the pathway is a first-match if/else, so QuestBridge shadowed every
  // regional branch — a student could hold UC schools with no UC deadline shown.
  it('reports UC App for a QuestBridge profile that also picks the West', () => {
    const plan = computePlan({ ...QB, regions: ['West'] });
    expect(plan.pathway).toContain('QuestBridge');
    const systems = planSystems(plan);
    expect(systems).toContain('UC App');
    expect(systems).toContain('QuestBridge');
  });

  it('reports Cal State Apply when a Cal State lands on the list', () => {
    const plan = computePlan({ regions: ['West'], colleges: ['In-state / commuter'] });
    const named = [...plan.reach, ...plan.target, ...plan.likely].map((s) => s.name);
    if (named.some((n) => n.includes('Cal State'))) {
      expect(planSystems(plan)).toContain('Cal State Apply');
    }
  });

  it('always includes Common App, which every list draws on', () => {
    expect(planSystems(computePlan({}))).toContain('Common App');
  });

  // Plans saved before `systems` existed must still produce deadlines.
  it('falls back to parsing school tags for a legacy plan', () => {
    const plan = computePlan({ regions: ['West'] });
    const legacy = { ...plan, systems: undefined };
    expect(planSystems(legacy)).toContain('UC App');
  });
});

describe('HBCU/HSI interest survives the branch chain', () => {
  // #35: 55.6% of HBCU pickers were shadowed into QuestBridge or UC, and their
  // plan then read as if they had never said it.
  it('adds CBCA when QuestBridge wins the branch', () => {
    const plan = computePlan({ ...QB, colleges: ['HBCU / HSI'] });
    expect(plan.pathway).toContain('QuestBridge');
    expect(plan.pathway).toContain('CBCA');
    expect(plan.why).toMatch(/HBCU/i);
    expect(planSystems(plan)).toContain('CBCA');
  });

  it('adds CBCA when the West/UC branch wins', () => {
    const plan = computePlan({ regions: ['West'], colleges: ['HBCU / HSI'] });
    expect(plan.pathway).toContain('UC Application');
    expect(plan.pathway).toContain('CBCA');
    expect(planSystems(plan)).toContain('CBCA');
  });

  it('does not double up when CBCA already won the branch', () => {
    const plan = computePlan({ colleges: ['HBCU / HSI'] });
    expect(plan.pathway).toBe('CBCA + Common App');
    expect(plan.pathway.match(/CBCA/g)).toHaveLength(1);
  });
});

describe('grade reaches the output', () => {
  // #36: exhaustive enumeration showed grade changed no Plan field at all.
  it('gives a 9th grader different guidance than a senior', () => {
    const ninth = computePlan({ grade: '9th grade' });
    const senior = computePlan({ grade: '12th grade' });
    expect(ninth.timeline).not.toBe(senior.timeline);
    expect(ninth.timeline).toMatch(/aren't yours yet/i);
    expect(senior.timeline).toMatch(/your cycle/i);
  });

  it('covers every grade option with its own framing', () => {
    const grades = ['9th grade', '10th grade', '11th grade', '12th grade', 'Gap year'];
    for (const g of grades) expect(timelineFor(g)).toBeTruthy();
    expect(new Set(grades.map(timelineFor)).size).toBeGreaterThan(1);
  });

  it('carries grade through so later steps need not re-ask', () => {
    expect(computePlan({ grade: '11th grade' }).grade).toBe('11th grade');
  });
});

describe("'Not sure yet' is recorded as unchosen", () => {
  it('marks the track as a default rather than a choice', () => {
    const plan = computePlan({ track: 'Not sure yet' });
    expect(plan.trackName).toBe('Self-paced course');
    expect(plan.trackChosen).toBe(false);
  });

  it('marks an explicit answer as chosen', () => {
    expect(computePlan({ track: 'Self-paced' }).trackChosen).toBe(true);
    expect(computePlan({ track: 'With a coach' }).trackChosen).toBe(true);
  });
});
