import { Link } from 'react-router';
import { navLinks } from '../data/nav';
import { Wordmark } from './Wordmark';

interface FooterProps {
  hasPlan?: boolean;
}

export function Footer({ hasPlan = false }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer__contact">
        <span className="eyebrow">Keep the conversation going</span>
        <h2>
          A question.
          <br />A draft. A fresh start.
        </h2>
        <Link className="bar-link" to="/join">
          <span>Let’s talk</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="footer__grid">
        <div className="footer__col--left">
          <Wordmark />
          <p className="footer__blurb">
            Built for the first in their family. The college application, demystified. Where to apply, how to apply, how
            to write the essays that get you in. Free.
          </p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <span className="eyebrow">Explore</span>
          {navLinks(hasPlan).map((n) => (
            <Link key={n.id} to={n.path}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="footer__resources">
          <span className="eyebrow">Your next step</span>
          <Link to="/router">Get your plan ↗</Link>
          <Link to="/writing-course">The writing course ↗</Link>
          <Link to="/list-builder">College list builder ↗</Link>
          <span className="footer__tag">● First-gen access</span>
        </div>
      </div>
      <div className="footer__legal">
        <span>© (Ad)mission Possible {new Date().getFullYear()}. A student-run project.</span>
        <Link className="footer__legal-link" to="/privacy">
          Privacy
        </Link>
        <span>Made for what comes next.</span>
      </div>
      <div className="footer__endmark" aria-hidden="true">
        Possible.
      </div>
    </footer>
  );
}
