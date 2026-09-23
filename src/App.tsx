import { Routes, Route } from 'react-router';
import { Chrome } from './components/Chrome';
import Home from './pages/Home';
import About from './pages/About';
import How from './pages/How';
import Offer from './pages/Offer';
import Join from './pages/Join';
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
        <Route path="/join" element={<Join />} />
        <Route path="/team/:slug" element={<TeamMember />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
