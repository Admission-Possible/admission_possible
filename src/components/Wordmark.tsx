interface WordmarkProps {
  white?: boolean;
}

// Admission Possible logo. The `white` variant (dark backgrounds, e.g. the menu)
// renders the mark in white via a CSS filter since the artwork has dark text.
export function Wordmark({ white }: WordmarkProps) {
  const cls = 'wordmark' + (white ? ' wordmark--white' : '');
  return (
    <div className={cls}>
      {/* Intrinsic size declared so the wordmark's horizontal extent doesn't
          shift on decode; CSS still drives the rendered height. */}
      <img className="wordmark__img" src="/logo.webp" alt="Admission Possible" width={190} height={184} />
    </div>
  );
}
