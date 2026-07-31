import { Link } from 'react-router';
import { useScrollHideHeader } from '../hooks/useScrollHideHeader';
import { Wordmark } from './Wordmark';

export function Header({ onMenu }: { onMenu: () => void }) {
  const ref = useScrollHideHeader<HTMLElement>();
  return (
    <header className="header" ref={ref}>
      <div className="header__bar">
        <button className="menu-toggle" aria-label="Open menu" onClick={onMenu}>
          <img className="menu-toggle__img" src="/icons/menu.png" alt="" />
        </button>
        <Link className="wordmark-link" to="/" aria-label="Home">
          <Wordmark />
        </Link>
      </div>
      <div className="rule" />
    </header>
  );
}
