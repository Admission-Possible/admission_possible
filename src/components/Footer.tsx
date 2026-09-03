import { Link } from 'react-router';
import { navLinks } from '../data/nav';
import { Wordmark } from './Wordmark';

interface FooterProps {
  /** Adds the "My plan" entry once the student has completed the intake. */
  hasPlan?: boolean;
}

export function Footer({ hasPlan = false }: FooterProps) {
  return (
    <footer className="footer">
      <div className="rule" />
      <div className="footer__grid">
        <div className="footer__col--left">
          <Wordmark />
          <p className="footer__blurb">
            Built for the first in their family. The college application, demystified. Where to apply, how to apply, how
            to write the essays that get you in. Free.
          </p>
        </div>
        <div className="vrule vrule--center" />
        <div className="footer__menu">
          <div className="label">Menu</div>
          <div className="footer__links">
            {navLinks(hasPlan).map((n) => (
              <Link key={n.id} to={n.path}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="rule" />
      <div className="footer__legal">
        <div>© (Ad)mission Possible {new Date().getFullYear()}. A nonprofit. Admission, made possible.</div>
        <div className="footer__tag">● First-gen access</div>
      </div>
    </footer>
  );
}
