import { Link } from 'react-router';
import { useScrollHideHeader } from '../hooks/useScrollHideHeader';
import { Wordmark } from './Wordmark';

export function Header({ onMenu }: { onMenu: () => void }) {
  const ref = useScrollHideHeader<HTMLElement>();
  return (
    <header className="header" ref={ref}>
      <div className="header__bar">
        <Link className="wordmark-link" to="/" aria-label="Home">
          <Wordmark />
        </Link>
        <button className="menu-toggle" aria-label="Open menu" aria-haspopup="dialog" onClick={onMenu}>
          <span className="roll-label">
            <span>Explore the guide</span>
            <span aria-hidden="true">Explore the guide</span>
          </span>
          <span className="nav-plus" aria-hidden="true">
            +
          </span>
        </button>
        <span className="header__spacer" />
        <Link className="header__about" to="/about">
          <span className="roll-label">
            <span>About us</span>
            <span aria-hidden="true">About us</span>
          </span>
        </Link>
        <Link className="header__join" to="/join">
          <span className="roll-label">
            <span>Get involved</span>
            <span aria-hidden="true">Get involved</span>
          </span>
          <span className="nav-plus" aria-hidden="true">
            ↗
          </span>
        </Link>
      </div>
    </header>
  );
}
