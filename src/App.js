import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react'; // Add this import
import './app.scss';
import { warmUpServer } from './utils/serverWarmup'; // Ensure this import is present
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
  useEffect(() => {
    // Warm up server on initial app load
    warmUpServer();

    // Optional: Set up periodic warm-up
    const intervalId = setInterval(warmUpServer, 25 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs once on mount

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