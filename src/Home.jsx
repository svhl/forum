import React, { useEffect, useState } from "react";
import "./Home.css";
import ShinyText from "./ShinyText.jsx";
import ScreenTooSmall from "./ScreenTooSmall.jsx";
import SignUp from "./SignUp.jsx";
import Login from "./Login.jsx";
import Beams from "./Beams.jsx";

function Home() {
  const [tooSmall, setTooSmall] = useState(window.innerWidth < 1000);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleResize = () => setTooSmall(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (tooSmall) return <ScreenTooSmall />;

  return (
    <div className="home-root">
      <div className="beams-bg">
        <Beams
          beamWidth={5}
          beamHeight={30}
          beamNumber={20}
          lightColor="#646464"
          speed={4}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      <div
        className={`home-slide ${showSignUp || showLogin ? "slide-up" : ""}`}
      >
        <div className="home-container">
          <header>
            <p className="user-text">jennifer</p>
            <p className="hero-text">hi! anyone there?</p>
            <p className="user-text">nczceta</p>
            <p className="hero-text">o.o wow this is like irc</p>
            <p className="hero-text">what is this place?</p>
            <ShinyText text="Welcome to The 4M!" className="heading-text" />
            <p className="user-text">jennifer</p>
            <p className="hero-text">enjoy simple discussions!</p>
            <p className="user-text">parsnip</p>
            <p className="hero-text">what's up :)</p>
            <div className="button-group">
              <button
                className="signup-btn"
                onClick={() => setShowSignUp(true)}
              >
                Sign Up
              </button>
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                Login
              </button>
            </div>
          </header>
          <footer>
            <p>
              &copy; {new Date().getFullYear()} The 4M. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
      <div className={`signup-slide ${showSignUp ? "slide-in" : ""}`}>
        <SignUp onClose={() => setShowSignUp(false)} />
      </div>
      <div className={`login-slide ${showLogin ? "slide-in" : ""}`}>
        <Login onClose={() => setShowLogin(false)} />
      </div>
    </div>
  );
}

export default Home;
