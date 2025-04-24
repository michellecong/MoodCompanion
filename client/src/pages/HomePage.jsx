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
    <main className="home-page" role="main">
      {/* Hero section - visible to all users */}
      <section className="hero-section" role="region" aria-labelledby="hero-title">
        <div className="hero-content">
          <h1 id="hero-title">Your Personal AI Mood Companion</h1>
          <p className="sr-only">
            Track your emotions, journal your thoughts, and find support in our
            community
          </p>

          {!isAuthenticated ? (
            <div className="cta-buttons">
              <Link
                to="/login"
                className="cta-secondary"
                aria-label="Log in or get started"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <nav
              className="feature-nav-buttons"
              aria-label="Feature navigation buttons"
            >
              <Link
                to="/journals"
                className="feature-button"
                aria-label="Go to Journals section"
              >
                <div className="feature-icon" aria-hidden="true">
                  <FaBook />
                </div>
                <span>Journal</span>
              </Link>
              <Link
                to="/mood-tracking"
                className="feature-button"
                aria-label="Go to Mood Tracking section"
              >
                <div className="feature-icon" aria-hidden="true">
                  <FaChartLine />
                </div>
                <span>MoodTrack</span>
              </Link>
              <Link
                to="/chat"
                className="feature-button"
                aria-label="Go to AI Companion chat"
              >
                <div className="feature-icon" aria-hidden="true">
                  <FaRobot />
                </div>
                <span>AI Companion</span>
              </Link>
              <Link
                to="/posts"
                className="feature-button"
                aria-label="Go to Community posts"
              >
                <div className="feature-icon" aria-hidden="true">
                  <FaUsers />
                </div>
                <span>Community</span>
              </Link>
            </nav>
          )}
        </div>
      </section>

      {/* Daily affirmation and quick actions */}
      <section className="split-content" aria-labelledby="affirmation-title">
        <div className="split-main">
          <h2 id="affirmation-title" className="sr-only">Daily Affirmation</h2>
          <DailyAffirmation />
        </div>
        <div className="split-sidebar">
          <Weather />
        </div>
      </section>

      {/* Render based on authentication status */}
      {isAuthenticated ? (
        <Dashboard isLoading={isLoading} recentJournals={recentJournals} />
      ) : (
        <LandingPage />
      )}
    </main>
  );
}

export default HomePage;
