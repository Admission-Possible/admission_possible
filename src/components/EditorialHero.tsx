import type { ReactNode } from 'react';
import { AdmissionArt } from './AdmissionArt';
import '../styles/interior.css';

type EditorialHeroProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: 'pink' | 'plum' | 'lavender' | 'blue' | 'sky';
  note?: string;
  children?: ReactNode;
  art?: 'pathways' | 'writing' | 'support' | 'mission';
};

/** A chapter opening: a colored masthead followed by an asymmetric editorial deck. */
export function EditorialHero({
  kicker,
  title,
  description,
  tone = 'pink',
  note = 'A guide to what comes next',
  children,
  art,
}: EditorialHeroProps) {
  return (
    <>
      <header className={`editorial-hero editorial-hero--${tone}`}>
        <div className="editorial-hero__heading">
          <p className="editorial-hero__kicker">{kicker}</p>
          <h1 className="editorial-hero__title">{title}</h1>
        </div>
        <p className="editorial-hero__note">{note}</p>
      </header>
      {art && (
        <div className={`editorial-art editorial-art--${art}`}>
          <AdmissionArt variant={art} />
          <AdmissionArt variant={art === 'pathways' ? 'mission' : 'pathways'} />
        </div>
      )}
      {children}
      {description && (
        <div className="editorial-deck">
          <span className="label">The overview</span>
          <p className="editorial-deck__text">{description}</p>
        </div>
      )}
    </>
  );
}
