import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';
import { PATHWAYS } from '../data/pathways';
import { useHydrated } from '../hooks/useHydrated';
import { loadIntake } from '../data/storage';

export default function Pathways() {
  // Storage is unavailable during the prerender, so the first render must
  // match it and the plan-aware bits appear after hydration (#45).
  const hydrated = useHydrated();
  const intake = hydrated ? loadIntake() : null;

  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('pathways')} />
      <div className="rule" />

      <div className="page-intro">
        <h1 className="page-intro__title" data-reveal="">
          Application pathways
        </h1>
        <p className="page-intro__lede" data-reveal="">
          Every front door, side by side. We route you to the right ones based on your plan.
        </p>
      </div>

      {/* A real table: this page exists to let students compare systems, but
          the axes were never named. Screen readers got 24 unrelated strings,
          and below 860px the grid collapsed to one unlabelled column — four
          cryptic stacked lines on a phone. data-label supplies the header text
          for that stacked view. */}
      <table className="pathways__table">
        <caption className="visually-hidden">Application systems compared</caption>
        <thead>
          <tr>
            <th scope="col">Pathway</th>
            <th scope="col">Best for</th>
            <th scope="col">Key fact</th>
            <th scope="col">Money</th>
          </tr>
        </thead>
        <tbody>
          {PATHWAYS.map((row) => (
            <tr className="pathways__row" key={row.name}>
              <th scope="row" className="pathways__name" data-label="Pathway">
                {row.name}
              </th>
              <td className="pathways__cell" data-label="Best for">
                {row.bestFor}
              </td>
              <td className="pathways__cell" data-label="Key fact">
                {row.fact}
              </td>
              <td className="pathways__cell pathways__cell--muted" data-label="Money">
                {row.money}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pathways__note">
        Deadlines and mechanics change yearly — always confirm the current details on each system's official site.
      </div>

      <div className="section-cta">
        {/* Plan-aware: a student who already has a pathway was being sent
            back to question 1, which overwrote the plan on completion. */}
        {intake ? <Circle to="/plan">See my pathway</Circle> : <Circle to="/router">See my pathway</Circle>}
      </div>
    </main>
  );
}
