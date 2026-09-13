import { Circle } from '../components/Circle';
import { EditorialHero } from '../components/EditorialHero';

export default function NotFound() {
  return (
    <main className="interior">
      <EditorialHero
        kicker="404 / Page not found"
        title="This page didn't make the cut."
        tone="pink"
        note="Let's find your way back"
        description="The link you followed leads nowhere — but the path to college still does. Let's get you back on it."
      />

      <div className="section-cta">
        <Circle to="/">Back to the start</Circle>
      </div>
    </main>
  );
}
