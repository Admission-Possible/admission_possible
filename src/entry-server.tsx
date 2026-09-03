import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';
import { ALL_ROUTES, ROUTE_DESCRIPTIONS, SITE_ORIGIN } from './data/routes';
import { titleForPath } from './data/titles';
import './styles/global.css';

// Re-exported so the prerender script can read the route manifest and title
// rules from this one SSR bundle rather than importing app source directly.
export { ALL_ROUTES, ROUTE_DESCRIPTIONS, SITE_ORIGIN, titleForPath };

/**
 * Render one route to HTML at build time (see scripts/prerender.mjs).
 *
 * No ErrorBoundary and no <Analytics> here: the boundary is a client recovery
 * affordance, and analytics must never fire during a build.
 */
export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
