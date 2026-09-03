import { describe, it, expect } from 'vitest';
import appSource from '../App.tsx?raw';
import vercel from '../../vercel.json';
import { ALL_ROUTES, MARKETING_ROUTES, ROUTE_DESCRIPTIONS, SITE_ORIGIN } from './routes';
import { TEAM } from './team';

// #45: with the SPA catch-all removed, a route missing from this manifest is
// not prerendered and 404s in production. These keep the two in step.
describe('the prerender manifest matches App.tsx', () => {
  const declared = [...appSource.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);

  it('finds the routes declared in App', () => {
    expect(declared.length).toBeGreaterThan(10);
  });

  it('prerenders every static route App declares', () => {
    const staticRoutes = declared.filter((r) => r !== '*' && !r.includes(':'));
    for (const route of staticRoutes) {
      expect(ALL_ROUTES).toContain(route);
    }
  });

  it('expands the dynamic team route to one path per member', () => {
    expect(declared).toContain('/team/:slug');
    for (const member of TEAM) {
      expect(ALL_ROUTES).toContain(`/team/${member.slug}`);
    }
  });

  it('gives every marketing route its own description', () => {
    for (const route of MARKETING_ROUTES) {
      expect(ROUTE_DESCRIPTIONS[route]).toBeTruthy();
    }
  });

  it('keeps descriptions within a sane meta length', () => {
    for (const [route, text] of Object.entries(ROUTE_DESCRIPTIONS)) {
      expect(text.length, route).toBeLessThanOrEqual(300);
    }
  });

  it('builds canonicals from an absolute https origin', () => {
    expect(SITE_ORIGIN).toMatch(/^https:\/\//);
    expect(SITE_ORIGIN.endsWith('/')).toBe(false);
  });
});

describe('deploy config', () => {
  // The catch-all rewrite was what turned unknown paths into 200-status soft
  // 404s. Every route is a real file now, so it has to stay gone.
  it('serves no SPA catch-all rewrite', () => {
    expect('rewrites' in vercel).toBe(false);
  });

  it('keeps the security headers on every path', () => {
    expect(vercel.headers[0].source).toBe('/(.*)');
  });
});
