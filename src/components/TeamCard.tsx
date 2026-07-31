import type { CSSProperties } from 'react';
import { Link } from 'react-router';

interface TeamCardProps {
  name: string;
  photo: string;
  /** Where "Get to know me" points. */
  to?: string;
  /** Resting tilt in degrees — each card gets a different orientation. */
  tilt?: number;
}

// Mint photo card in the style of the reference: name heading, framed portrait,
// and a "Get to know me" link. Cards sit at a slight tilt and straighten on hover.
export function TeamCard({ name, photo, to = '/router', tilt = 0 }: TeamCardProps) {
  // The reveal wrapper owns the fade/translate transform; the inner link owns the
  // tilt rotation — kept on separate elements so they don't clobber each other.
  return (
    <div className="teamcard-wrap" data-reveal="">
      <Link className="teamcard" to={to} style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
        <h3 className="teamcard__name">Hey, I'm {name}</h3>
        <div className="teamcard__frame">
          <img className="teamcard__photo" src={photo} alt={`${name}, founding team`} loading="lazy" />
        </div>
        <span className="teamcard__link">Get to know me &rarr;</span>
      </Link>
    </div>
  );
}
