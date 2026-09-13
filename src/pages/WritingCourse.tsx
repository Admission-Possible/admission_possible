import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumb } from '../data/nav';
import { EditorialHero } from '../components/EditorialHero';

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
      <EditorialHero
        kicker="The writing course / Eight modules"
        title={
          <>
            Show me you can write.
            <br />
            Don't just tell me.
          </>
        }
        tone="plum"
        art="writing"
        note="From picking a topic to the final draft"
        description="This is the path we take you through, module by module — from picking a topic to the last short answer. The syllabus below is real; the in-browser lessons are still being built. Ask for a coach and we'll work through it with you over email in the meantime."
      />
      <Crumbs crumbs={[navCrumb('offer'), { label: 'The writing course' }]} />

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
        {/* Was /router, which restarted the 7-question intake from scratch —
            a dead end for anyone who had already finished it. */}
        <Circle to="/join">Ask for a coach</Circle>
      </div>
    </main>
  );
}
