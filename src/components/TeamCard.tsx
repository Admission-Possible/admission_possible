import type { CSSProperties } from 'react';

interface TeamCardProps {
  name: string;
  photo: string;
  /** Resting tilt in degrees — each card gets a different orientation. */
  tilt?: number;
  /** Toggles this member's intro panel open/closed. */
  onSelect: () => void;
  selected: boolean;
  /** id of the intro panel this card controls while selected. */
  panelId: string;
}

// Mint photo card in the style of the reference: name heading, framed portrait,
// and a "Get to know me" prompt. Cards sit at a slight tilt and straighten on hover.
// aria-controls is set only on the selected card: while collapsed the shared panel
// is not in the DOM, and a collapsed card shouldn't claim another member's panel.
export function TeamCard({ name, photo, tilt = 0, onSelect, selected, panelId }: TeamCardProps) {
  const style = { '--tilt': `${tilt}deg` } as CSSProperties;

  // The reveal wrapper owns the fade/translate transform; the inner button
  // owns the tilt rotation — kept on separate elements so they don't clobber each other.
  return (
    <div className="teamcard-wrap" data-reveal="">
      <button
        type="button"
        className={'teamcard teamcard--button' + (selected ? ' is-selected' : '')}
        style={style}
        onClick={onSelect}
        aria-expanded={selected}
        aria-controls={selected ? panelId : undefined}
      >
        <span className="teamcard__name">Hey, I'm {name}</span>
        <span className="teamcard__frame">
          {/* Decorative: the button text already names the member. */}
          <img className="teamcard__photo" src={photo} alt="" loading="lazy" />
        </span>
        <span className="teamcard__link">Get to know me &rarr;</span>
      </button>
    </div>
  );
}
