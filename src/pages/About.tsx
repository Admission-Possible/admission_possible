import { EditorialHero } from '../components/EditorialHero';
import { TeamStrip } from '../components/TeamStrip';
import { FIRST_GEN_LINE, ORIGIN } from '../data/content';

export default function About() {
  return (
    <main className="interior about">
      <EditorialHero
        kicker="(Ad)mission Possible"
        title="About us"
        tone="lavender"
        description={
          <>
            {ORIGIN} We built (Ad)mission Possible so the next student doesn’t have to figure it out alone.{' '}
            {FIRST_GEN_LINE.join(' ')}
          </>
        }
      />
      <TeamStrip />
    </main>
  );
}
