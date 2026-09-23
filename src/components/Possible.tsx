/**
 * The emphasised "possible": italic, purple, with an underline that draws in
 * as it reveals. The same treatment lands on "Possible" in the opening
 * sequence, so the page ends on the word it began with.
 */
export function Possible({ children = 'possible' }: { children?: string }) {
  return (
    <em className="possible" data-reveal="line">
      {children}
    </em>
  );
}
