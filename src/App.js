import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './app.scss';

import Header from './componenets/header';
import Home from './componenets/homepage/';
import Ide from './componenets/ide';
import Footer from './componenets/footer';
import Contest from './componenets/contest';
import SingleContest from './componenets/SingleContest';
import ProblemPage from './componenets/problems';
import SingleQuestion from './componenets/SingleQuestion';

// Create a wrapper component for Footer
const FooterWrapper = () => {
  const location = useLocation();
  // Hide footer if the current path matches the SingleQuestion route pattern
  if (location.pathname.match(/^\/problem\/\d+\/\w+$/)) {
    return null;
  }

  return <Footer />;
};
const HeaderWrapper = () => {
  const location = useLocation();
  // Hide footer if the current path matches the SingleQuestion route pattern
  if (location.pathname.match(/^\/problem\/\d+\/\w+$/)) {
    return null;
  }

  return <Header />;
};

const App = () => {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <HeaderWrapper />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ide" element={<Ide />} />
          <Route path="/contests" element={<Contest />} />
          <Route path="/contest/:id" element={<SingleContest />} />
          <Route path="/problems" element={<ProblemPage />} />
          <Route path="/problem/:contestId/:problemId" element={<SingleQuestion />} />
        </Routes>
      </main>
      <FooterWrapper />
    </Router>
  );
};

export default App;
