import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';
import { Icon } from '../components/Icon';
import { EditorialHero } from '../components/EditorialHero';

export default function Coaching() {
  return (
    <main className="interior">
      <EditorialHero
        kicker="03 / A person in your corner"
        title="A coach who was a first-gen applicant two years ago."
        tone="sky"
        art="support"
        note="Near-peer guidance. Always free."
      />
      <Crumbs crumbs={navCrumbs('coaching')} />
      <div className="triband coaching-features">
        <div className="triband__col">
          <Icon name="people" className="triband__icon" />
          <div className="triband__k">Near-peer</div>
          <div className="triband__v">They've just survived this exact climb.</div>
        </div>
        <div className="triband__slash" />
        <div className="triband__col">
          <Icon name="write" className="triband__icon" />
          <div className="triband__k">Draft review</div>
          <div className="triband__v">The human hour goes entirely to your essay.</div>
        </div>
      </div>

      <p className="callout" data-reveal="">
        The course is the coach training. The students we help become the coaches who help the next ones.
      </p>

      <div className="section-cta">
        <Circle to="/join">Book a coach</Circle>
      </div>
    </main>
  );
}
