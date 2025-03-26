
import { Link } from 'react-router-dom'; 
import journalImg from "../../assets/images/journal.jpg";
import chatImg from "../../assets/images/chat.jpg";
import diagramImg from "../../assets/images/diagram.jpg";
import wishingImg from "../../assets/images/wishing.jpg";

function LandingPage() {
  return (
    <div className="features-section">
      <h2>Features to Support Your Emotional Well-being</h2>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <img src={journalImg} alt="Digital Journal" />
          </div>
          <h3>Digital Journal</h3>
          <p>
            Record your thoughts and emotions with our AI-powered journal that
            provides emotional insights.
          </p>
          <Link to="/journals">Go to Journals</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={chatImg} alt="AI Companion" />
          </div>
          <h3>AI Companion</h3>
          <p>
            Chat with our AI assistant for emotional support, encouragement, and
            personalized advice.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={diagramImg} alt="Mood Tracking" />
          </div>
          <h3>Mood Tracking</h3>
          <p>
            Visualize your emotional patterns over time to build greater
            self-awareness.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src={wishingImg} alt="Wishing Well Community" />
          </div>
          <h3>Wishing Well Community</h3>
          <p>
            Share thoughts anonymously and connect with others facing similar
            experiences.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
