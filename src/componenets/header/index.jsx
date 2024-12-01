import React from "react";
import { useState } from 'react';

import { Link } from "react-router-dom"; // If you use routing for pages
import logo from "../../assets/logo-header.png";
import "./style.scss";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/" className="nav-link">
          <img src={logo} alt="CODADDY" />
        </Link>
      </div>

      <div className="menu-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link
          to="#"
          className="nav-link"
          onClick={() => window.open(`${window.location.origin}/ide`, "_blank", "noopener,noreferrer")}
        >
          Code Editor
        </Link>
        <Link to="/contests" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          Codeforces Contests
        </Link>
        <Link to="/problems" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          Codeforces Problems
        </Link>
      </div>
    </div>
  );
};

export default Header;
