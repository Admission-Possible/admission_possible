import { describe, it, expect } from 'vitest';
// Vite's ?raw import keeps this in the app's type world — no @types/node needed.
import css from './global.css?raw';

// #37: ratios are computed from the stylesheet, not eyeballed, so a future
// palette tweak that reintroduces a failure fails CI instead of shipping.

/** Read a custom property's value straight out of :root. */
function token(name: string): string {
  const m = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
  if (!m) throw new Error(`token --${name} not found in global.css`);
  return m[1];
}

const lin = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const BG = token('bg');
const CARD = token('card');
const INK = token('ink');
const MUTED = token('muted');
const MENU = token('menu-bg');
const ACCENT_TEXT = token('accent-text');
const HAIRLINE_STRONG = token('hairline-strong');
const WHITE = '#FFFFFF';

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3.0;

describe('WCAG 1.4.3 — small text meets 4.5:1', () => {
  const cases: [string, string, string][] = [
    ['accent text on the page background', ACCENT_TEXT, BG],
    ['accent text on cards', ACCENT_TEXT, CARD],
    ['CTA and skip-link label on the accent fill', WHITE, ACCENT_TEXT],
    ['team card text on its fill', CARD, ACCENT_TEXT],
    ['story secondary text on the page', MUTED, BG],
    ['menu links on the overlay', WHITE, MENU],
    ['body text on the page', INK, BG],
  ];
  for (const [label, fg, bg] of cases) {
    it(label, () => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(AA_TEXT));
  }
});

describe('WCAG 1.4.11 — non-text UI meets 3:1', () => {
  it('focus ring inside the menu overlay', () => {
    expect(ratio(WHITE, MENU)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it('focus ring on the page', () => {
    expect(ratio(ACCENT_TEXT, BG)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it('unchecked answer marks and the progress track', () => {
    expect(ratio(HAIRLINE_STRONG, BG)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

describe('skill pills carry ink, not white', () => {
  // White ran 1.84-2.93:1 on these fills.
  const PASTELS = ['#E8968A', '#E8B84B', '#8FCB9B', '#7FB2DD', '#D69CC4'];
  for (const fill of PASTELS) {
    it(`ink on ${fill}`, () => expect(ratio(INK, fill)).toBeGreaterThanOrEqual(AA_TEXT));
  }
});

describe('the decorative accent is not used for text', () => {
  it('keeps the brand accent for decoration only', () => {
    // It is retained deliberately — it just must never carry small text.
    expect(ratio(token('accent'), BG)).toBeLessThan(AA_TEXT);
    expect(css).toContain('--accent-text');
  });

  it('leaves no small-text rule pointing at the decorative accent', () => {
    const textRules = css.split('\n').filter((l) => /color:\s*var\(--accent\)/.test(l) && !/--accent-text/.test(l));
    expect(textRules).toEqual([]);
  });
});
