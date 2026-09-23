import type { CSSProperties } from 'react';
import { EditorialHero } from '../components/EditorialHero';
import { HOW_STEPS } from '../data/content';

// Only the provided How It Works content: five steps and their points. The
// spacing and motion carry the structure, not extra explanation.
export default function How() {
  return (
    <main className="interior how">
      <EditorialHero
        kicker="(Ad)mission Possible"
        title="How it works"
        tone="pink"
        description="Five steps from where you are to where you’re going."
      />
      <ol className="how-steps">
        {HOW_STEPS.map((step, n) => (
          <li key={step.title} className="how-step" data-reveal="group">
            <span className="divider" />
            <span className="how-step__num" style={{ '--i': 0 } as CSSProperties}>
              {String(n + 1).padStart(2, '0')}
            </span>
            <h2 className="how-step__title" style={{ '--i': 1 } as CSSProperties}>
              {step.title}
            </h2>
            <ul className="how-step__points">
              {step.points.map((point, p) => (
                <li key={point} style={{ '--i': p + 2 } as CSSProperties}>
                  {point}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}
