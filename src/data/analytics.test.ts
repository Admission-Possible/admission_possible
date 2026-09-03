import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackEvent } from './analytics';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
const { track } = await import('@vercel/analytics');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(track).mockClear();
});

describe('analytics', () => {
  it('sends nothing outside production, so local runs record no data', () => {
    trackEvent({ name: 'join_submitted' });
    expect(track).not.toHaveBeenCalled();
  });

  it('sends the event and its properties in production', () => {
    vi.stubEnv('PROD', true);
    trackEvent({ name: 'intake_step', step: 3 });
    expect(track).toHaveBeenCalledWith('intake_step', { step: 3 });
  });

  // The intake holds first-gen status and Pell eligibility; none of it should
  // ever reach an analytics payload.
  it('carries a step number, never an answer', () => {
    vi.stubEnv('PROD', true);
    trackEvent({ name: 'intake_step', step: 5 });
    const [, properties] = vi.mocked(track).mock.calls[0];
    expect(Object.keys(properties as object)).toEqual(['step']);
  });

  it('never lets a failing beacon break the funnel', () => {
    vi.stubEnv('PROD', true);
    vi.mocked(track).mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => trackEvent({ name: 'plan_generated', pathway: 'Common App' })).not.toThrow();
  });
});
