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

  // ⛔ Prevent any rendering until Auth0 is done loading
  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  // 🧱 Safely return Landing Page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="home-page">
        <LandingPage />
      </div>
    );
  }

  // ✅ Authenticated layout
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Personal AI Mood Companion</h1>
          <p>
            Track your emotions, journal your thoughts, and find support in our community
          </p>

          <div className="feature-nav-buttons">
            <Link to="/journals" className="feature-button">
              <div className="feature-icon"><FaBook /></div>
              <span>Journal</span>
            </Link>
            <Link to="/mood-tracking" className="feature-button">
              <div className="feature-icon"><FaChartLine /></div>
              <span>MoodTrack</span>
            </Link>
            <Link to="/chat" className="feature-button">
              <div className="feature-icon"><FaRobot /></div>
              <span>AI Companion</span>
            </Link>
            <Link to="/posts" className="feature-button">
              <div className="feature-icon"><FaUsers /></div>
              <span>Community</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="split-content">
        <div className="split-main"><DailyAffirmation /></div>
        <div className="split-sidebar"><Weather /></div>
      </div>

      <Dashboard isLoading={isLoading} recentJournals={recentJournals} />
    </div>
  );
}

export default HomePage;