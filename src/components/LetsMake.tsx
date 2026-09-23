import { Link } from 'react-router';
import { JOIN_NAV } from '../data/nav';
import { Plus } from './Plus';

const LINES = ['Let’s make', 'admission', 'possible.'];

/**
 * The closing invitation. Black ground, large type, purple on hover: each line
 * rolls to a purple twin as the pointer crosses it, and the whole block is the
 * way into Join us. The type itself is the visual, not a card around it.
 */
export function LetsMake() {
  return (
    <section className="lets-make" aria-label="Join us">
      <Link to={JOIN_NAV.path} className="lets-make__link">
        <span className="visually-hidden">Let’s make admission possible. {JOIN_NAV.label}</span>
        {LINES.map((line) => (
          <span key={line} className="lets-make__line" aria-hidden="true">
            <span>{line}</span>
            <span>{line}</span>
          </span>
        ))}
        <span className="lets-make__cta" aria-hidden="true">
          {JOIN_NAV.label} <Plus />
        </span>
      </Link>
    </section>
  );
}
