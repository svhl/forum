import React, { useState, useEffect } from "react";
import "./Home.css";
import ShinyText from "./ShinyText.jsx";
import SignUp from "./SignUp.jsx";
import Login from "./Login.jsx";
import Beams from "./Beams.jsx";

function Home() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [footerIndex, setFooterIndex] = useState(0);
  const footerTexts = [
    "&copy; " + new Date().getFullYear() + " The 4M. All rights reserved.",
    "Developed by Muhammed S. Suhail",
    "Check it out on <a href='https://github.com/svhl/forum' target='_blank'>GitHub</a>",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFooterIndex((prev) => (prev + 1) % footerTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-root">
      <div className={`main-fade${showSignUp || showLogin ? " faded" : ""}`}>
        <div className="beams-bg">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#858585"
            speed={4}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>

        <div className="home-slide">
          <div className="home-container">
            <header>
              <p
                className="user-text"
                style={{ color: "#c295eb", transform: "translateX(-10rem)" }}
              >
                jennifer
              </p>
              <p
                className="hero-text"
                style={{ transform: "translateX(-10rem)" }}
              >
                hi! anyone there?
              </p>
              <p
                className="user-text"
                style={{ color: "#a6de2f", transform: "translateX(30rem)" }}
              >
                nczceta
              </p>
              <p
                className="hero-text"
                style={{ transform: "translateX(30rem)" }}
              >
                wow this is like irc
              </p>
              <p
                className="hero-text"
                style={{ transform: "translateX(30rem)" }}
              >
                a minimal social media :)
              </p>
              <ShinyText text="Welcome to The 4M!" className="heading-text" />
              <p
                className="user-text"
                style={{ color: "#c295eb", transform: "translateX(-5rem)" }}
              >
                jennifer
              </p>
              <p
                className="hero-text"
                style={{ transform: "translateX(-5rem)" }}
              >
                login below to chat!
              </p>
              <p
                className="user-text"
                style={{ color: "#ffc200", transform: "translateX(25rem)" }}
              >
                parsnip
              </p>
              <p
                className="hero-text"
                style={{ transform: "translateX(25rem)" }}
              >
                or sign up if you haven't already
              </p>
              <div className="button-group-1">
                <button
                  className="signup-btn"
                  onClick={() => setShowSignUp(true)}
                >
                  Sign Up
                </button>
                <button
                  className="login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              </div>
            </header>
            <footer>
              <p
                className="footer-text"
                dangerouslySetInnerHTML={{ __html: footerTexts[footerIndex] }}
              />
            </footer>
          </div>
        </div>
      </div>

      {/* Fade in/out for SignUp */}
      <div className={`fade-modal${showSignUp ? " visible" : ""}`}>
        {showSignUp && <SignUp onClose={() => setShowSignUp(false)} />}
      </div>
      {/* Fade in/out for Login */}
      <div className={`fade-modal${showLogin ? " visible" : ""}`}>
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </div>
    </div>
  );
}

export default Home;
