// Build-time prerender (issue #45).
//
// The served body was `<div id="root"></div>` and nothing else, so a 280KB JS
// chunk had to execute before any text existed. Only Google reliably runs JS;
// Bing, DuckDuckGo, and every link-preview and AI crawler indexed nothing but a
// shared head. This renders each route to its own HTML file, which also gives
// per-route titles, descriptions, canonicals and og:url in the same move.
//
// Run after both Vite builds:
//   vite build && vite build --ssr src/entry-server.tsx --outDir dist/server
//   node scripts/prerender.mjs

import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const { render, ALL_ROUTES, ROUTE_DESCRIPTIONS, SITE_ORIGIN, titleForPath } = await import(
  pathToFileURL(join(DIST, 'server/entry-server.js')).href
);

const template = await readFile(join(DIST, 'index.html'), 'utf8');

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the value of a <meta> whose selector attribute matches. */
function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  return re.test(html) ? html.replace(re, `$1${escapeAttr(value)}$2`) : html;
}

const NOSCRIPT = `<noscript><p style="padding:6vw;font:16px/1.6 system-ui,sans-serif">
(Ad)mission Possible — the college application, demystified. Where to apply, how to apply, and how to write the essays
that get you in. Free, and built for the first in their family. This site needs JavaScript for the 2-minute intake;
everything else is readable without it.</p></noscript>`;

let written = 0;
for (const route of ALL_ROUTES) {
  const appHtml = render(route);
  const canonical = `${SITE_ORIGIN}${route === '/' ? '/' : route}`;
  const title = titleForPath(route);
  const description = ROUTE_DESCRIPTIONS[route] ?? ROUTE_DESCRIPTIONS['/'];

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>\n    ${NOSCRIPT}`);

  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);

  const outFile = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html, 'utf8');
  written++;
}

// Unknown paths: Vercel serves a static 404.html with a real 404 status once the
// catch-all rewrite is narrowed, instead of 200-ing thin content under the
// marketing title.
const notFoundHtml = template
  .replace(/<title>[^<]*<\/title>/, `<title>Page not found — (Ad)mission Possible</title>`)
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
  .replace('<div id="root"></div>', `<div id="root">${render('/404')}</div>\n    ${NOSCRIPT}`);
await writeFile(join(DIST, '404.html'), notFoundHtml, 'utf8');

// The SSR bundle is a build artifact; it must not ship.
await rm(join(DIST, 'server'), { recursive: true, force: true });

console.log(`prerendered ${written} routes + 404.html`);
