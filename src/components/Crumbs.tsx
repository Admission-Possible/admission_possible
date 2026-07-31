import { Fragment } from 'react';
import { Link } from 'react-router';
import type { Crumb } from '../types';
import { Slash } from './Slash';

// The inline-slash nav band: items spread full width with tall leaning
// slashes between, plus leading and trailing slashes.
export function Crumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="crumbs">
      <Slash variant="nav" />
      {crumbs.map((c, i) => (
        <Fragment key={i}>
          {c.to ? (
            <Link to={c.to} data-nav="">
              {c.label}
            </Link>
          ) : (
            <span className="crumbs__current">{c.label}</span>
          )}
          <Slash variant="nav" />
        </Fragment>
      ))}
    </div>
  );
}
