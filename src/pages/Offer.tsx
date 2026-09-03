import { Link } from 'react-router';
import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';
import { Icon } from '../components/Icon';

export default function Offer() {
  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('offer')} />
      <div className="rule" />

      {/* Block A: headline left, ruled list right */}
      <div className="offer__block">
        <div data-reveal="">
          <Icon name="course" className="offer__head-icon" />
          <h3 className="offer__head">Self-paced course</h3>
          <p className="offer__body">
            Work independently, not alone. An eight-module path through the essays, from picking a topic to the last
            short answer. The modules are written; we're building them out lesson by lesson. Free.
          </p>
          <p className="body-right" style={{ marginTop: 24 }}>
            <Link className="ov-link" to="/writing-course">
              See the writing course →
            </Link>
          </p>
        </div>
        <div data-reveal="" className="ruled-list">
          <div>Eight modules, topic to final draft</div>
          <div>Prompts you work through on your own</div>
          <div>A coach reads your draft when you ask</div>
          <div>In the works: lessons you complete in the browser</div>
        </div>
      </div>

      {/* Block B: ruled list left, headline right */}
      <div className="offer__block offer__block--alt">
        <div data-reveal="" className="ruled-list">
          <div>Near-peer coach match</div>
          <div>1:1 draft review</div>
          <div>Accountability + check-ins</div>
          <div>Ask for a coach and we'll email you back</div>
        </div>
        <div data-reveal="">
          <Icon name="coaching" className="offer__head-icon" />
          <h3 className="offer__head">1:1 Coaching</h3>
          <p className="offer__body">
            Want a person? Get matched with a coach who was a first-gen applicant two years ago. Free — there's nothing
            to pay for anywhere on this site.
          </p>
          <p className="body-right" style={{ marginTop: 24 }}>
            <Link className="ov-link" to="/coaching">
              More on coaching →
            </Link>
          </p>
        </div>
      </div>

      <div className="section-cta">
        <Circle to="/router">Get my plan</Circle>
      </div>
    </main>
  );
}
