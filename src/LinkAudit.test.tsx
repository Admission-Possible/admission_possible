import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import App from './App';
import { INFO_NAV, JOIN_NAV, NAV } from './data/nav';
import { ALL_ROUTES, TEAM_ROUTES } from './data/routes';
import { renderWithRouter } from './test/utils';

// The content revision deleted seven routes. A link left pointing at any of
// them would land a student on the 404, so every internal link on every page
// (and in the header, menu and footer around it) must resolve to a route App
// actually serves.
const STATIC_ROUTES = new Set(['/', '/about', '/how', '/offer', '/join', '/privacy']);
const REMOVED = ['pathways', 'coaching', 'router', 'plan', 'dashboard', 'list-builder', 'writing-course'];

function isServed(path: string): boolean {
  return STATIC_ROUTES.has(path) || TEAM_ROUTES.includes(path);
}

/** Render a route with the menu open, so header, menu, page and footer are all in the DOM. */
function renderWithMenu(route: string) {
  renderWithRouter(<App />, { route });
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
  return [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => a.getAttribute('href')!);
}

const hrefsIn = (el: HTMLElement) =>
  within(el)
    .getAllByRole('link')
    .map((a) => a.getAttribute('href'));

afterEach(cleanup);

describe('link audit', () => {
  it('audits the team pages App serves', () => {
    expect(TEAM_ROUTES.length).toBeGreaterThan(0);
    for (const route of TEAM_ROUTES) expect(route).toMatch(/^\/team\/[a-z0-9-]+$/);
  });

  for (const route of ALL_ROUTES) {
    it(`every internal link on ${route} points at a served route`, () => {
      const hrefs = renderWithMenu(route);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        for (const removed of REMOVED) {
          expect(href, `${route} links to ${href}`).not.toMatch(new RegExp(`(^|/)${removed}(/|$|[?#])`));
        }
        if (/^(https?:|mailto:)/.test(href)) continue;
        if (href.startsWith('#')) {
          // In-page anchors must land on something.
          expect(document.getElementById(href.slice(1)), `${route}: ${href}`).not.toBeNull();
          continue;
        }
        const path = href.split(/[?#]/)[0];
        expect(isServed(path), `${route} links to ${href}`).toBe(true);
      }
    });
  }

  it('never links to a removed route from the 404 page either', () => {
    const hrefs = renderWithMenu('/does-not-exist');
    for (const href of hrefs) {
      expect(isServed(href.split(/[?#]/)[0]) || /^(https?:|mailto:|#)/.test(href), href).toBe(true);
    }
  });
});

describe('one navigation set across header, menu and footer', () => {
  it('offers only the pages that exist', () => {
    expect(NAV.map((n) => n.path)).toEqual(['/', '/about', '/how', '/offer', '/join']);
    expect(INFO_NAV.map((n) => n.label)).toEqual(['About us', 'How it works', 'What we offer']);
    expect(JOIN_NAV).toMatchObject({ label: 'Join us', path: '/join' });
  });

  it('header shows the guide toggle, the three info pages and Join us', () => {
    renderWithRouter(<App />, { route: '/about' });
    const header = document.querySelector('header.header') as HTMLElement;
    expect(within(header).getByRole('button', { name: 'Open menu' })).toHaveTextContent('Explore the guide');
    const nav = within(header).getByRole('navigation', { name: 'Main' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => [a.textContent?.slice(0, a.textContent.length / 2), a.getAttribute('href')]),
    ).toEqual(INFO_NAV.map((n) => [n.label, n.path]));
    expect(within(header).getByRole('link', { name: 'Join us' })).toHaveAttribute('href', '/join');
    expect(within(header).getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('menu lists exactly NAV, and marks the current page', () => {
    renderWithRouter(<App />, { route: '/how' });
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Site menu' });
    expect(within(dialog).getByText('Explore the guide')).toBeInTheDocument();
    const links = within(dialog).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(NAV.map((n) => n.path));
    expect(links.map((a) => a.querySelector('span')?.textContent)).toEqual(NAV.map((n) => n.label));
    expect(within(dialog).getByRole('link', { current: 'page' })).toHaveAttribute('href', '/how');
  });

  it('footer carries the brand, description, info links, Join us, privacy and the endmark', () => {
    renderWithRouter(<App />, { route: '/' });
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toMatch(/guided mentorship that can span months or years/i);
    const nav = within(footer).getByRole('navigation', { name: 'Footer' });
    expect(hrefsIn(nav)).toEqual(INFO_NAV.map((n) => n.path));
    expect(within(footer).getByRole('link', { name: 'Join us' })).toHaveAttribute('href', '/join');
    expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    const endmark = footer.querySelector('.footer__endmark')!;
    expect(endmark.textContent?.replace(/\s+/g, ' ').trim()).toBe('Admission Possible');
    expect(footer.lastElementChild).toBe(endmark);
  });

  it('header, menu and footer together offer the same destinations as NAV, and nothing else', () => {
    renderWithRouter(<App />, { route: '/offer' });
    const header = document.querySelector('header.header') as HTMLElement;
    const footer = screen.getByRole('contentinfo');
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = screen.getByRole('dialog');

    const navPaths = new Set(NAV.map((n) => n.path));
    expect(new Set(hrefsIn(header))).toEqual(navPaths);
    expect(new Set(hrefsIn(menu))).toEqual(navPaths);
    // The footer adds only the privacy page (and a contact mailto when configured).
    expect(new Set(hrefsIn(footer))).toEqual(new Set([...INFO_NAV.map((n) => n.path), '/join', '/privacy']));
  });

  it('no longer offers a "My plan" entry anywhere', () => {
    renderWithRouter(<App />, { route: '/' });
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.queryByText(/my plan/i)).not.toBeInTheDocument();
  });
});
