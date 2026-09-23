import { Link } from 'react-router';
import { INFO_NAV, JOIN_NAV } from '../data/nav';
import { Plus } from './Plus';
import { Wordmark } from './Wordmark';

// The contact address is only shown when configured, and only if it is a
// mailbox the project controls (same rule as the Join page fallback).
const contactEmail = () => (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim();

/**
 * Branding, a short description, the core navigation, Join us, approved
 * contact, and the legal line — then the closing "Admission Possible" statement.
 * No social links are listed: none have been approved yet.
 */
export function Footer() {
  const contact = contactEmail();
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <Wordmark white />
          <p className="footer__blurb">
            Admission Possible provides guided mentorship that can span months or years, helping students discover their
            direction, carve their own path, and work toward their long-term goals.
          </p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <span className="eyebrow">Explore</span>
          {INFO_NAV.map((n) => (
            <Link key={n.id} to={n.path}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="footer__join">
          <span className="eyebrow">Next step</span>
          <Link className="footer__join-link" to={JOIN_NAV.path}>
            <span>{JOIN_NAV.label}</span>
            <Plus />
          </Link>
          {contact && <a href={`mailto:${contact}`}>{contact}</a>}
        </div>
      </div>
      <div className="footer__legal">
        <span>© (Ad)mission Possible {new Date().getFullYear()}. A student-run project.</span>
        <Link className="footer__legal-link" to="/privacy">
          Privacy
        </Link>
      </div>
      <p className="footer__endmark" aria-hidden="true" data-reveal="rise">
        <span>Admission</span> <span>Possible</span>
      </p>
    </footer>
  );
}
