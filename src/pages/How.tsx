import { Fragment } from 'react';
import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';
import { Icon } from '../components/Icon';
import { Slash } from '../components/Slash';
import type { IconName } from '../types';

// The five phases of the admissions process, in the order a student moves
// through them: the list comes before the essays, and the portals you apply
// through follow from the list — not from us.
const STEPS: { icon: IconName; title: string; desc: string; details: string[] }[] = [
  {
    icon: 'route',
    title: 'Route',
    desc: 'Answer a few questions. We map your situation and your path.',
    details: [
      'Answer a few questions and provide details about your background.',
      'We map your situation and your path — where you are, and where you can go.',
    ],
  },
  {
    icon: 'list',
    title: 'Build your list',
    desc: 'A balanced college list across fit and finances.',
    details: [
      'A college list selection designed just for you.',
      'Balanced across preference and financials — reach, target, and likely.',
    ],
  },
  {
    icon: 'write',
    title: 'Learn & write',
    desc: 'Produce-as-you-learn modules turn your story into essays.',
    details: [
      'Produce-as-you-learn modules to turn your story into essays.',
      'One-on-one peer coaching, with an online coach that tracks your progress.',
    ],
  },
  {
    icon: 'apply',
    title: 'Apply',
    desc: 'Your list decides the portals — and we walk you through each one.',
    details: [
      'Through your college selection, we route you to the specific application portals: QuestBridge, UC, Common App, etc.',
    ],
  },
  {
    icon: 'submit',
    title: 'Submit',
    desc: 'Deadlines, drafts, and next steps in one calm place.',
    details: ['An organized list with deadlines, drafts, preparations, and the next step — all in one calm place.'],
  },
];

export default function How() {
  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('how')} />
      <div className="rule" />

      <div className="page-intro">
        <h1 className="page-intro__title" data-reveal="">
          How admissions works
        </h1>
        <p className="page-intro__lede" data-reveal="">
          The same five phases every school expects — demystified. Answer a few questions, and we map the rest with you.
        </p>
      </div>

      {/* Each step is preceded by a slash divider (5 slashes, no trailing). */}
      <div className="how__track">
        {STEPS.map((s) => (
          <Fragment key={s.title}>
            <Slash variant="how" animated />
            <div className="how__step">
              <Icon name={s.icon} className="step-icon" />
              <div data-reveal="" className="how__step-title">
                {s.title}
              </div>
              <div className="how__step-desc">{s.desc}</div>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="how__foot">
        <div className="label">The process</div>
        <div />
      </div>
      <div className="rule rule--mt-sm" />

      {/* WHAT EACH PHASE ENTAILS — scroll-down detail for every step above. */}
      <section className="phases">
        <div className="team__head">
          <div className="label">Step by step</div>
          <p className="team__intro">What each phase entails, from the first question to the final submission.</p>
        </div>
        {STEPS.map((s, i) => (
          <div className="phase" key={s.title} data-reveal="">
            <div className="phase__num">{String(i + 1).padStart(2, '0')}</div>
            <h2 className="phase__title">{s.title}</h2>
            <div className="phase__body">
              {s.details.map((line) => (
                <p className="phase__line" key={line}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="section-cta">
        <Circle to="/router">Get my plan</Circle>
      </div>
    </main>
  );
}
