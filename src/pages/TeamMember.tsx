import { Link, Navigate, useParams } from 'react-router';
import { getMember, hasStory } from '../data/team';

// Pastel palette cycled across the skill pills. Pills carry ink text, not
// white — white ran 1.84-2.93:1 on these fills. Ink clears 4.9:1 on all of
// them; the coral was lightened from #E07A6B (ink 3.90:1) to reach that.
const TAG_COLORS = ['#E8968A', '#E8B84B', '#8FCB9B', '#7FB2DD', '#D69CC4', '#E8968A'];

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
        {back}
        <h1 className="story__title">{member.fullName}</h1>
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
      {back}

      <h1 className="story__title" data-reveal="">
        My story
      </h1>

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
