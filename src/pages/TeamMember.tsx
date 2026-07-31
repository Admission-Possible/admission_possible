import { Link, Navigate, useParams } from 'react-router';
import { getMember } from '../data/team';

// Pastel palette cycled across the skill pills (mirrors the reference layout).
const TAG_COLORS = ['#E07A6B', '#E8B84B', '#8FCB9B', '#7FB2DD', '#D69CC4', '#E07A6B'];

export default function TeamMember() {
  const { slug } = useParams();
  const member = getMember(slug);
  if (!member) return <Navigate to="/" replace />;

  return (
    <main className="interior story">
      <Link className="story__back" to="/">
        <span aria-hidden="true">&larr;</span> Back to Home
      </Link>

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
        {member.tags.map((tag, i) => (
          <li key={tag} className="story__tag" style={{ background: TAG_COLORS[i % TAG_COLORS.length] }}>
            {tag}
          </li>
        ))}
      </ul>
    </main>
  );
}
