// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DailyAffirmation from "../components/home/DailyAffirmation";
import Weather from "../components/home/Weather";
import Dashboard from "../components/home/Dashboard";
import LandingPage from "../components/home/LandingPage";
import { useUserData } from "../hooks/useUserData";
import "./HomePage.css";

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

          {!isAuthenticated && (
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-secondary">
                Login
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
