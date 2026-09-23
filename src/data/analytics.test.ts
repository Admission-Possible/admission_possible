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

  // The Join form holds first-gen status; none of it should ever reach an
  // analytics payload. Events carry a name and nothing else.
  it('sends the event name and no answers in production', () => {
    vi.stubEnv('PROD', true);
    trackEvent({ name: 'join_submitted' });
    expect(track).toHaveBeenCalledWith('join_submitted', {});
  });

  it('never lets a failing beacon break the form', () => {
    vi.stubEnv('PROD', true);
    vi.mocked(track).mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => trackEvent({ name: 'join_failed' })).not.toThrow();
  });
});
