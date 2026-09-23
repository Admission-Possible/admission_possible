import { Routes, Route } from 'react-router';
import { Chrome } from './components/Chrome';
import Home from './pages/Home';
import About from './pages/About';
import How from './pages/How';
import Offer from './pages/Offer';
import Pathways from './pages/Pathways';
import Coaching from './pages/Coaching';
import Join from './pages/Join';
import WritingCourse from './pages/WritingCourse';
import ListBuilder from './pages/ListBuilder';
import Router from './pages/Router';
import Plan from './pages/Plan';
import Dashboard from './pages/Dashboard';
import TeamMember from './pages/TeamMember';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Chrome />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how" element={<How />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/writing-course" element={<WritingCourse />} />
        <Route path="/list-builder" element={<ListBuilder />} />
        <Route path="/pathways" element={<Pathways />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/join" element={<Join />} />
        <Route path="/router" element={<Router />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/team/:slug" element={<TeamMember />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
