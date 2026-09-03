import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveIntake, loadIntake, clearIntake, saveDraft, loadDraft, clearDraft } from './storage';
import { computePlan } from './plan';

describe('intake storage', () => {
  // The intake is durable now, so both stores must be reset between cases.
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns null when nothing is stored', () => {
    expect(loadIntake()).toBeNull();
  });

  it('reports success when the intake is stored', () => {
    const intake = { answers: {}, plan: computePlan({}) };
    expect(saveIntake(intake)).toBe(true);
  });

  it('reports failure when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const intake = { answers: {}, plan: computePlan({}) };
    expect(saveIntake(intake)).toBe(false);
  });

  it('round-trips an intake', () => {
    const intake = { answers: { track: 'With a coach' }, plan: computePlan({ track: 'With a coach' }) };
    saveIntake(intake);
    const loaded = loadIntake();
    expect(loaded?.plan.trackName).toBe('1:1 Coaching');
    expect(loaded?.answers.track).toBe('With a coach');
  });

  it('returns null on malformed JSON', () => {
    localStorage.setItem('ap.intake', '{not json');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when the plan is an empty object', () => {
    localStorage.setItem('ap.intake', '{"plan":{}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when plan arrays are missing or the wrong type', () => {
    localStorage.setItem('ap.intake', '{"plan":{"pathway":"x","why":"y","reach":"nope","target":[],"likely":[]}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when pathway/why are not strings', () => {
    localStorage.setItem('ap.intake', '{"plan":{"pathway":1,"why":2,"reach":[],"target":[],"likely":[]}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when the top-level value is not an object', () => {
    localStorage.setItem('ap.intake', '"just a string"');
    expect(loadIntake()).toBeNull();
    localStorage.setItem('ap.intake', 'null');
    expect(loadIntake()).toBeNull();
  });

  it('persists the intake durably so it survives a new tab', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    // A new tab gets a fresh sessionStorage but keeps localStorage.
    sessionStorage.clear();
    expect(loadIntake()).not.toBeNull();
  });

  it('still reads an intake left in sessionStorage by an older build', () => {
    const intake = { answers: {}, plan: computePlan({}) };
    sessionStorage.setItem('ap.intake', JSON.stringify(intake));
    expect(loadIntake()).not.toBeNull();
  });

  it('clears the intake from both stores', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    clearIntake();
    expect(loadIntake()).toBeNull();
  });

  it('still saves when localStorage is unavailable', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    expect(saveIntake({ answers: {}, plan: computePlan({}) })).toBe(true);
  });
});

describe('intake draft', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips mid-quiz progress', () => {
    saveDraft(3, { grade: '11th' });
    expect(loadDraft()).toEqual({ step: 3, answers: { grade: '11th' } });
  });

  it('returns null when nothing is drafted', () => {
    expect(loadDraft()).toBeNull();
  });

  it('returns null on a malformed draft', () => {
    sessionStorage.setItem('ap.intake.draft', '{"step":"nope"}');
    expect(loadDraft()).toBeNull();
  });

  it('clears the draft', () => {
    saveDraft(2, {});
    clearDraft();
    expect(loadDraft()).toBeNull();
  });
});

describe('isValidIntake rejects tampered payloads', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // #52: arrays were checked, elements were not — [null] reached Plan and threw.
  it('rejects a school list holding a null element', () => {
    localStorage.setItem(
      'ap.intake',
      JSON.stringify({ plan: { pathway: 'x', why: 'y', reach: [null], target: [], likely: [] } }),
    );
    expect(loadIntake()).toBeNull();
  });

  it('rejects a school entry with no name', () => {
    localStorage.setItem(
      'ap.intake',
      JSON.stringify({ plan: { pathway: 'x', why: 'y', reach: [{ tag: 't' }], target: [], likely: [] } }),
    );
    expect(loadIntake()).toBeNull();
  });

  // An arbitrary override flowed straight through the track ternaries.
  it('rejects a trackOverride that is not a real track name', () => {
    const intake = { answers: {}, plan: computePlan({}), trackOverride: 'EVIL' };
    localStorage.setItem('ap.intake', JSON.stringify(intake));
    expect(loadIntake()).toBeNull();
  });

  it('accepts a valid trackOverride', () => {
    saveIntake({ answers: {}, plan: computePlan({}), trackOverride: '1:1 Coaching' });
    expect(loadIntake()?.trackOverride).toBe('1:1 Coaching');
  });
});
