// src/pages/Login Page.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DailyAffirmation from "../components/home/DailyAffirmation";
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
      <DailyAffirmation />

      {/* Render different content based on authentication status */}
      {isAuthenticated ? (
        <Dashboard
          isLoading={isLoading}
          recentJournals={recentJournals}
          currentMood={currentMood}
          onMoodSelect={setCurrentMood}
        />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}

export default HomePage;
