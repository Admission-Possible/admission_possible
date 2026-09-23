/**
 * The site's one "+" mark: the Explore the guide treatment (size, weight,
 * baseline and quarter-turn on hover), reused everywhere a plus appears so
 * no two icon styles mix. Decorative; the control around it carries the name.
 */
export function Plus({ className = '' }: { className?: string }) {
  return (
    <span className={`plus ${className}`.trim()} aria-hidden="true">
      +
    </span>
  );
}
