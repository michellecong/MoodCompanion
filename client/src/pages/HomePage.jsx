import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MoodTracker from '../components/journal/MoodTracker';
import JournalPreview from '../components/journal/JournalPreview';
import './HomePage.css';

function HomePage({ isAuthenticated, user }) {
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [recentJournals, setRecentJournals] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Affirmations list
  const affirmations = [
    "You are capable of amazing things. Today is full of possibilities.",
    "Your emotions are valid. It's okay to feel what you're feeling.",
    "Take a moment to breathe deeply and appreciate yourself today.",
    "Small steps forward are still progress. You're doing great.",
    "Your presence in this world matters. You make a difference."
  ];

  // Get random affirmation
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setDailyAffirmation(affirmations[randomIndex]);
    
    // If authenticated, fetch user data
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setRecentJournals([
        { 
          _id: '1', 
          title: 'A good day', 
          content: 'Today was productive and I felt energized throughout.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          emotionsDetected: [
            { name: 'joy', score: 0.8 },
            { name: 'satisfaction', score: 0.7 }
          ]
        },
        { 
          _id: '2', 
          title: 'Feeling anxious about presentation', 
          content: 'I have a big presentation tomorrow and I\'m feeling nervous.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          emotionsDetected: [
            { name: 'anxiety', score: 0.6 },
            { name: 'fear', score: 0.4 }
          ]
        }
      ]);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };

  const handleMoodSelection = (mood) => {
    setCurrentMood(mood);
  };

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
          {isLoading ? (
            <div className="loading">Loading your personal dashboard...</div>
          ) : (
            <>
              <div className="dashboard-row">
                <div className="dashboard-card mood-card">
                  <h2>How are you feeling today?</h2>
                  <MoodTracker onMoodSelect={handleMoodSelection} selectedMood={currentMood} />
                </div>
              </div>

              <div className="dashboard-row">
                <div className="dashboard-card journal-card">
                  <div className="card-header">
                    <h2>Recent Journal Entries</h2>
                    <Link to="/journal" className="view-all">View All</Link>
                  </div>
                  <JournalPreview journals={recentJournals} />
                  <Link to="/journal/new" className="new-entry-btn">
                    + New Journal Entry
                  </Link>
                </div>
              </div>
            </>
          )}
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