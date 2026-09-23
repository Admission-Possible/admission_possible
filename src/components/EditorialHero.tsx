import type { ReactNode } from 'react';
import '../styles/interior.css';

type EditorialHeroProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: 'pink' | 'plum' | 'lavender' | 'blue' | 'sky';
  children?: ReactNode;
};

/** A chapter opening: a colored masthead followed by an asymmetric editorial deck. */
export function EditorialHero({ kicker, title, description, tone = 'pink', children }: EditorialHeroProps) {
  return (
    <>
      <header className={`editorial-hero editorial-hero--${tone}`}>
        <div className="editorial-hero__heading">
          <p className="editorial-hero__kicker">{kicker}</p>
          <h1 className="editorial-hero__title" data-reveal="mask">
            {title}
          </h1>
        </div>
      </header>
      {children}
      {description && (
        <div className="editorial-deck" data-reveal="group">
          <span className="divider" />
          <p className="editorial-deck__text">{description}</p>
        </div>
      )}
    </>
  );
}
