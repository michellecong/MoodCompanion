// src/components/home/Dashboard.jsx
import { Link } from "react-router-dom";
import MoodTracker from "../journal/MoodTracker";
import JournalPreview from "../journal/JournalPreview";

function Dashboard({ isLoading, recentJournals, currentMood, onMoodSelect }) {
  if (isLoading) {
    return <div className="loading">Loading your personal dashboard...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-row">
        <div className="dashboard-card mood-card">
          <h2>How are you feeling today?</h2>
          <MoodTracker onMoodSelect={onMoodSelect} selectedMood={currentMood} />
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card journal-card">
          <div className="card-header">
            <h2>Recent Journal Entries</h2>
            <Link to="/journal" className="view-all">
              View All
            </Link>
          </div>
          <JournalPreview journals={recentJournals} />
          <Link to="/journal/new" className="new-entry-btn">
            + New Journal Entry
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
