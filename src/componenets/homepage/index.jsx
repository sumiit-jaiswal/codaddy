import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Codeforces made easy with Codaddy!</h1>
          <p>
            Practice problems, solve contest question, and write code in our
            integrated IDE like leetcode
          </p>
          <p>All in One Solution for codeforces problem solving</p>
          <div className="hero-buttons">
            <a
              href="/ide"
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
            >
              Code Editor
            </a>
            <Link to="/contests" className="btn secondary">
              Explore Contests
            </Link>
            <Link to="/problems" className="btn secondary">
              Browse Problems
            </Link>
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Use Codaddy?</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Interactive IDE</h3>
            <p>
              Write and test code instantly in multiple languages with live
              feedback.
            </p>
          </div>
          <div className="feature">
            <h3>Codeforces Integration</h3>
            <p>Explore problems and contests from Codeforces seamlessly.</p>
          </div>
          <div className="feature">
            <h3>Practice Questions</h3>
            <p>Solve questions with real-time test case evaluations.</p>
          </div>
          <div className="feature">
            <h3>Detailed Contest Pages</h3>
            <p>
              Participate in contests or revisit past ones to improve your
              skills.
            </p>
          </div>
        </div>
        <p>Note: currently we have not implemented the feature to get the question from live contest but it will be implemented soon</p>
      </section>

      {/* Recent Contests Section
      <section className="recent-contests">
        <h2>Recent Contests</h2>
        <div className="contest-list">
          <Link to="/contests/123" className="contest-card">
            Codeforces Round #123
          </Link>
          <Link to="/contests/124" className="contest-card">
            Codeforces Round #124
          </Link>
          <Link to="/contests/125" className="contest-card">
            Codeforces Round #125
          </Link>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
