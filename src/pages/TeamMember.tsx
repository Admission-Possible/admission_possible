import { Link, Navigate, useParams } from 'react-router';
import { getMember, hasStory } from '../data/team';
import { EditorialHero } from '../components/EditorialHero';

// Pastel palette cycled across the skill pills. Pills carry ink text, not
// white — white ran 1.84-2.93:1 on these fills. Ink clears 4.9:1 on all of
// them; the coral was lightened from #E07A6B (ink 3.90:1) to reach that.
const TAG_COLORS = ['#FDC5F5', '#F7AEF8', '#B388EB', '#8093F1', '#72DDF7', '#FDC5F5'];

export default function TeamMember() {
  const { slug } = useParams();
  const member = getMember(slug);
  if (!member) return <Navigate to="/" replace />;

  const back = (
    <Link className="story__back" to="/about">
      <span aria-hidden="true">&larr;</span> Back to About us
    </Link>
  );

  // No approved copy yet. Say that plainly instead of rendering a testimony
  // page around invented quotes.
  if (!hasStory(member)) {
    return (
      <main className="interior story">
        <EditorialHero
          kicker="About us / Founding team"
          title={member.fullName}
          tone="lavender"
          note="The people behind the project"
        />
        {back}
        <p className="story__bio story__bio--placeholder">
          {member.name} is on the founding team. Their profile isn't written yet — we'd rather leave this blank than put
          words in their mouth.
        </p>
        <ul className="story__tags">
          {member.roles.map((role) => (
            <li key={role} className="story__tag story__tag--role">
              {role}
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="interior story">
      <EditorialHero
        kicker={`About us / ${member.fullName}`}
        title="My story"
        tone="lavender"
        note="The people behind the project"
      />
      {back}

      <div className="story__grid">
        <p className="story__path">{member.path}</p>
        <p className="story__bio">{member.bio}</p>
        <div className="story__belief-col">
          <p className="story__belief">{member.belief}</p>
          <p className="story__belief-sub">{member.beliefSub}</p>
        </div>
      </div>

      <div className="story__photo-wrap" data-reveal="">
        <img className="story__photo" src={member.storyPhoto} alt={`${member.name}, founding team`} />
      </div>

      <ul className="story__tags">
        {(member.tags ?? []).map((tag, i) => (
          <li key={tag} className="story__tag" style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}>
            {tag}
          </li>
        ))}
      </ul>
    </main>
  );
}
