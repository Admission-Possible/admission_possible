import { Link, NavLink } from 'react-router';
import { INFO_NAV, JOIN_NAV } from '../data/nav';
import { useScrollHideHeader } from '../hooks/useScrollHideHeader';
import { Plus } from './Plus';
import { Wordmark } from './Wordmark';

function Roll({ children }: { children: string }) {
  return (
    <span className="roll-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const ref = useScrollHideHeader<HTMLElement>();
  return (
    <header className="header" ref={ref}>
      <div className="header__bar">
        <Link className="wordmark-link" to="/" aria-label="Admission Possible, home">
          <Wordmark />
        </Link>
        <button className="menu-toggle" aria-label="Open menu" aria-haspopup="dialog" onClick={onMenu}>
          <Roll>Explore the guide</Roll>
          <Plus />
        </button>
        <nav className="header__nav" aria-label="Main">
          {INFO_NAV.map((n) => (
            <NavLink key={n.id} className="header__link" to={n.path}>
              <Roll>{n.label}</Roll>
            </NavLink>
          ))}
        </nav>
        <NavLink className="header__join" to={JOIN_NAV.path}>
          <Roll>{JOIN_NAV.label}</Roll>
          <Plus />
        </NavLink>
      </div>
    </header>
  );
}
