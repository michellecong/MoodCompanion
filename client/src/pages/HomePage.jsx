// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DailyAffirmation from "../components/home/DailyAffirmation";
import Weather from "../components/home/Weather";
import Dashboard from "../components/home/Dashboard";
import LandingPage from "../components/home/LandingPage";
import { useUserData } from "../hooks/useUserData";
import "./HomePage.css";
import { FaBook, FaChartLine, FaRobot, FaUsers } from "react-icons/fa";

function HomePage({ isAuthenticated, user }) {
  const { recentJournals, currentMood, setCurrentMood, isLoading } =
    useUserData(isAuthenticated);

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
          {/* Daily affirmation - visible to all users */}
          <DailyAffirmation />
        </div>
        <div className="split-sidebar">
          {/* Quick actions component */}
          <Weather />
        </div>
      </div>

      {/* Render different content based on authentication status */}
      {isAuthenticated ? (
        <Dashboard isLoading={isLoading} recentJournals={recentJournals} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default HomePage;
