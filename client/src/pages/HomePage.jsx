// src/pages/HomePage.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import DailyAffirmation from "../components/home/DailyAffirmation";
import Weather from "../components/home/Weather";
import Dashboard from "../components/home/Dashboard";
import LandingPage from "../components/home/LandingPage";
import { useUserData } from "../hooks/useUserData";
import "./HomePage.css";
import { FaBook, FaChartLine, FaRobot, FaUsers } from "react-icons/fa";

function HomePage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth0();

  const {
    recentJournals,
    currentMood,
    setCurrentMood,
    isLoading,
  } = useUserData(isAuthenticated);

  // Wait for Auth0 to finish loading before rendering
  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <div className="home-page">
      {/* Hero section - visible to all users */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Personal AI Mood Companion</h1>
          <p>
            Track your emotions, journal your thoughts, and find support in our
            community
          </p>

          {!isAuthenticated ? (
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="feature-nav-buttons">
              <Link to="/journals" className="feature-button">
                <div className="feature-icon">
                  <FaBook />
                </div>
                <span>Journal</span>
              </Link>
              <Link to="/mood-tracking" className="feature-button">
                <div className="feature-icon">
                  <FaChartLine />
                </div>
                <span>MoodTrack</span>
              </Link>
              <Link to="/chat" className="feature-button">
                <div className="feature-icon">
                  <FaRobot />
                </div>
                <span>AI Companion</span>
              </Link>
              <Link to="/posts" className="feature-button">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <span>Community</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Daily affirmation - visible to all users */}
      <div className="split-content">
        <div className="split-main">
          <DailyAffirmation />
        </div>
        <div className="split-sidebar">
          <Weather />
        </div>
      </div>

      {/* Authenticated user dashboard OR landing page */}
      {isAuthenticated ? (
        <Dashboard isLoading={isLoading} recentJournals={recentJournals} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default HomePage;
