import React from "react";
import "./SignUpAndLogin.css";
import ShinyText from "./ShinyText.jsx";

const SignUp = ({ onClose }) => (
  <div className="signup-container">
    <ShinyText text="Login" className="signup-heading" />
    <form className="signup-form">
      <input type="text" placeholder="Username" className="signup-input" />
      <input type="password" placeholder="Password" className="signup-input" />
    </form>
    <div className="button-group">
      <button type="submit" className="signup-submit-btn">
        Login
      </button>
      <button className="signup-close-btn" onClick={onClose}>
        Back
      </button>
    </div>
    <footer>
      <p>&copy; {new Date().getFullYear()} The 4M. All rights reserved.</p>
    </footer>
  </div>
);

export default SignUp;
