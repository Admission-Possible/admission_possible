import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveIntake, loadIntake } from './storage';
import { computePlan } from './plan';

describe('intake storage', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('returns null when nothing is stored', () => {
    expect(loadIntake()).toBeNull();
  });

  it('reports success when the intake is stored', () => {
    const intake = { answers: {}, plan: computePlan({}) };
    expect(saveIntake(intake)).toBe(true);
  });

  it('reports failure when sessionStorage is unavailable', () => {
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
    sessionStorage.setItem('ap.intake', '{not json');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when the plan is an empty object', () => {
    sessionStorage.setItem('ap.intake', '{"plan":{}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when plan arrays are missing or the wrong type', () => {
    sessionStorage.setItem('ap.intake', '{"plan":{"pathway":"x","why":"y","reach":"nope","target":[],"likely":[]}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when pathway/why are not strings', () => {
    sessionStorage.setItem('ap.intake', '{"plan":{"pathway":1,"why":2,"reach":[],"target":[],"likely":[]}}');
    expect(loadIntake()).toBeNull();
  });

  it('returns null when the top-level value is not an object', () => {
    sessionStorage.setItem('ap.intake', '"just a string"');
    expect(loadIntake()).toBeNull();
    sessionStorage.setItem('ap.intake', 'null');
    expect(loadIntake()).toBeNull();
  });
});
