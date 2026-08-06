interface WordmarkProps {
  white?: boolean;
}

// Admission Possible logo. The `white` variant (dark backgrounds, e.g. the menu)
// renders the mark in white via a CSS filter since the artwork has dark text.
export function Wordmark({ white }: WordmarkProps) {
  const cls = 'wordmark' + (white ? ' wordmark--white' : '');
  return (
    <div className={cls}>
      <img className="wordmark__img" src="/logo.png" alt="Admission Possible" />
    </div>
  );
}
