import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "./style.scss";

const Footer = () => {
  return (
    <div className="footer">
      <p className="footer-text">
        Developed by: <span className="developer-name">wizardaddy</span>
      </p>
      
      <a
        href="https://www.linkedin.com/in/sumiit-jaiswal/"
        target="_blank"
        rel="noopener noreferrer"
        className="linkedin-link"
      >
        <FontAwesomeIcon icon={faLinkedin} className="linkedin-icon" />
      </a>
      <p className="footer-text">
        For any suggestion or bug email me on: <span className="developer-name">iamwizardaddy@gmail.com</span>
      </p>
      <p>&copy; 2024 Codaddy. All Rights Reserved.</p>
    </div>
  );
};

export default Footer;
