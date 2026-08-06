import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumb } from '../data/nav';

const FACTORS: [string, string][] = [
  ['Academic', 'Programs, rigor, admit range vs your profile'],
  ['Financial', 'Net price not sticker, aid generosity, no-loan policies'],
  ['Social', 'Size, culture, first-gen support'],
  ['Geographic', 'Distance, urban/rural, in-state systems'],
  ['Cultural', 'Belonging, HBCU/HSI options'],
];

export default function ListBuilder() {
  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={[navCrumb('how'), { label: 'College list builder' }]} />
      <div className="rule" />

      <div className="page-intro">
        <h1 className="subhead" data-reveal="">
          A list built on fit and finances, not luck.
        </h1>
        <p className="page-intro__lede" data-reveal="">
          Balance is the whole game. We help you spread your list so an acceptance is likely and an affordable
          acceptance is likely too.
        </p>
      </div>

      <div className="triband">
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Reach</span>
          </div>
          <div className="triband__v">Ambitious, but worth the shot — especially where aid is strong.</div>
        </div>
        <div className="triband__slash" />
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Target</span>
          </div>
          <div className="triband__v">Your profile lines up with their admitted range.</div>
        </div>
        <div className="triband__slash" />
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Likely</span>
          </div>
          <div className="triband__v">A confident yes, and a price you can actually pay.</div>
        </div>
      </div>

      <div className="label" style={{ margin: '50px 0 0' }}>
        Fit, made concrete
      </div>
      <div className="feature-rows">
        {FACTORS.map(([k, v]) => (
          <div className="feature-row" key={k}>
            <div className="feature-row__k">{k}</div>
            <div className="feature-row__v">{v}</div>
          </div>
        ))}
      </div>

      <p className="callout" data-reveal="">
        Money decides where you can actually enroll. We teach FAFSA vs CSS, fee waivers, and the QuestBridge path as we
        go.
      </p>

      <div className="section-cta">
        <Circle to="/router">Build my list</Circle>
      </div>
    </main>
  );
}
