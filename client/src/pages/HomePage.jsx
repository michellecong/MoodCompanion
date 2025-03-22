import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage({ isAuthenticated }) {
  const [dailyAffirmation] = useState("You are capable of amazing things. Today is full of possibilities.");

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Personal AI Mood Companion</h1>
          <p>Track your emotions, journal your thoughts, and find support in our community</p>
          
          {!isAuthenticated && (
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary">Get Started</Link>
              <Link to="/login" className="cta-secondary">Login</Link>
            </div>
          )}
        </div>
      </section>

      <div className="daily-affirmation">
        <h3>Today's Affirmation</h3>
        <p>{dailyAffirmation}</p>
      </div>

      {isAuthenticated ? (
        <div className="user-dashboard">
          <p>User dashboard will be implemented here.</p>
        </div>
      ) : (
        <div className="features-section">
          <h2>Features to Support Your Emotional Well-being</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>Digital Journal</h3>
              <p>Record your thoughts and emotions with our AI-powered journal that provides emotional insights.</p>
            </div>
            
            <div className="feature-card">
              <h3>AI Companion</h3>
              <p>Chat with our AI assistant for emotional support, encouragement, and personalized advice.</p>
            </div>
            
            <div className="feature-card">
              <h3>Mood Tracking</h3>
              <p>Visualize your emotional patterns over time to build greater self-awareness.</p>
            </div>
            
            <div className="feature-card">
              <h3>Wishing Well Community</h3>
              <p>Share thoughts anonymously and connect with others facing similar experiences.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;