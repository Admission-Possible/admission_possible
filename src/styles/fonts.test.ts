import { describe, it, expect } from 'vitest';
import css from './global.css?raw';
import html from '../../index.html?raw';
import vercel from '../../vercel.json';

/** Comments explain the migration by name; only real references matter here. */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

// #49: these were the only third-party origins on the site, and every page view
// disclosed the visitor's IP and referer to Google — for an audience of minors.
describe('fonts are self-hosted', () => {
  it('leaves no Google Fonts origin in the stylesheet or the head', () => {
    for (const source of [css, html]) {
      const code = stripComments(source);
      expect(code).not.toContain('fonts.googleapis.com');
      expect(code).not.toContain('fonts.gstatic.com');
    }
  });

  it('declares every family from a local file', () => {
    const families = ['Geist', 'Geist Mono', 'Inter'];
    for (const family of families) {
      expect(css).toMatch(new RegExp(`font-family:\\s*'${family}';`));
    }
    const localSrc = css.match(/src: url\('\/fonts\/[^']+\.woff2'\)/g) ?? [];
    expect(localSrc.length).toBe(6);
  });

  it('preloads the faces the first screen paints with', () => {
    expect(html).toContain('rel="preload" href="/fonts/geist-mono-latin.woff2"');
    expect(html).toContain('rel="preload" href="/fonts/inter-latin.woff2"');
  });
});

describe('CSP', () => {
  const csp = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy')!.value;

  it('is fully self-hosted with no external origins', () => {
    expect(csp).not.toContain('https://');
    expect(csp).toContain("font-src 'self'");
  });

  it('drops the dead data: allowance in img-src', () => {
    expect(csp).toContain("img-src 'self';");
    expect(csp).not.toContain('data:');
  });

  it('sets form-action and object-src, which do not fall back to default-src', () => {
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");
  });
});

describe('caching', () => {
  const rule = (source: string) => vercel.headers.find((h) => h.source === source);

  it('serves content-hashed assets immutably', () => {
    const cc = rule('/assets/(.*)')!.headers[0];
    expect(cc.key).toBe('Cache-Control');
    expect(cc.value).toBe('public, max-age=31536000, immutable');
  });

  it('serves fonts immutably', () => {
    expect(rule('/fonts/(.*)')!.headers[0].value).toContain('immutable');
  });

  it('keeps the security headers applying to every path', () => {
    expect(vercel.headers[0].source).toBe('/(.*)');
  });
});
