import React, { useState } from "react";
import "./SignUpAndLogin.css";
import ShinyText from "./ShinyText.jsx";

const SignUp = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState("");

  const handleClose = () => {
    setUsername("");
    setPassword("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      window.alert("Please provide both username and password.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.alert("Sign up successful!");
        handleClose();
      } else {
        window.alert(data.message || "Sign up failed.");
      }
    } catch {
      window.alert("Could not connect to server.");
    }
  };

  return (
    <div className="signup-container">
      <ShinyText text="Sign Up" className="signup-heading" />
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="signup-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="signup-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="go-to-dashboard">
          Check it out before signing up? <a href="./dashboard">Click here</a>
        </p>
        <div className="button-group-2">
          <button type="submit" className="signup-submit-btn">
            Sign Up
          </button>
          <button
            type="button"
            className="signup-close-btn"
            onClick={handleClose}
          >
            Back
          </button>
        </div>
      </form>
      {popup && (
        <div
          style={{
            marginTop: "1rem",
            background: "#222",
            color: "#fff",
            padding: "1rem 2rem",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {popup}
        </div>
      )}
    </div>
  );
};

export default SignUp;
