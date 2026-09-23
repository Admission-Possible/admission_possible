import { Link } from 'react-router';
import { EditorialHero } from '../components/EditorialHero';
import { Plus } from '../components/Plus';

export default function NotFound() {
  return (
    <main className="interior">
      <EditorialHero
        kicker="404 / Page not found"
        title="This page doesn’t exist."
        tone="pink"
        description="The link you followed leads nowhere. Let’s get you back on your path."
      />
      <div className="page-end">
        <Link className="text-link" to="/">
          Back to the start <Plus />
        </Link>
      </div>
    </main>
  );
}
