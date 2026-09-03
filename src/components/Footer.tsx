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
          <nav className="footer__links" aria-label="Footer">
            {navLinks(hasPlan).map((n) => (
              <Link key={n.id} to={n.path}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="rule" />
      <div className="footer__legal">
        <div>
          {/* Was "A nonprofit." — the project is not incorporated, and the one
              line meant to build trust was a misrepresentation on every page. */}
          © (Ad)mission Possible {new Date().getFullYear()}. A student-run project.{' '}
          <Link className="footer__legal-link" to="/privacy">
            Privacy
          </Link>
        </div>
        <div className="footer__tag">● First-gen access</div>
      </div>
    </footer>
  );
}
