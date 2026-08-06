import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumb } from '../data/nav';

const MODULES: [string, string, string][] = [
  ['01', 'Essay topics', 'Values + Bullseye → three candidate topics'],
  ['02', 'Research your story', 'Concrete detail that only you could write'],
  ['03', 'Three structures', 'Montage / narrative / five-room, outlined'],
  ['04', 'Ten compelling moves', 'Braid ideas into experience'],
  ['05', 'Ten tactics', 'Rewrite your opening and closing lines'],
  ['06', 'The personal statement', 'Draft the whole thing'],
  ['07', 'Supplementals', 'Why Us / Why Major / Community / Activity'],
  ['08', 'Short answers', 'The 50-word "popcorn" questions'],
];

export default function WritingCourse() {
  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={[navCrumb('offer'), { label: 'The writing course' }]} />
      <div className="rule" />

      <div className="page-intro">
        <h1 className="subhead" data-reveal="">
          Show me you can write. Don't just tell me.
        </h1>
        <p className="page-intro__lede" data-reveal="">
          Every lesson ends in production. You write, right there, and a coach pushes you. You leave with a finished
          personal statement and a stack of supplementals.
        </p>
      </div>

      <div className="feature-rows">
        {MODULES.map(([num, title, note]) => (
          <div className="feature-row" key={num}>
            <div className="feature-row__k">
              <span className="num">{num}</span>
              {title}
            </div>
            <div className="feature-row__v">{note}</div>
          </div>
        ))}
      </div>

      <div className="section-cta">
        <Circle to="/router">Start writing</Circle>
      </div>
    </main>
  );
}
