import { Link } from "react-router-dom";
import JournalPreview from "../journal/JournalPreview";

function Dashboard({ isLoading, recentJournals }) {
  if (isLoading) {
    return <div className="loading">Loading your personal dashboard...</div>;
  }

  // calculate the recent emotion summary
  const getRecentEmotionSummary = () => {
    if (!recentJournals || recentJournals.length === 0) {
      return { topEmotion: "neutral", emoji: "😐" };
    }

    // summarize the emotions from recent journals
    const emotionCounts = {};
    recentJournals.forEach((journal) => {
      if (journal.emotionsDetected && journal.emotionsDetected.length > 0) {
        const topEmotion = journal.emotionsDetected.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );
        emotionCounts[topEmotion.name] =
          (emotionCounts[topEmotion.name] || 0) + 1;
      }
    });

    // find the most frequent emotion
    const topEmotion = Object.keys(emotionCounts).reduce(
      (a, b) => (emotionCounts[a] > emotionCounts[b] ? a : b),
      "neutral"
    );

    const emojiMap = {
      excited: "🤩",
      content: "😊",
      depressed: "😔",
      lonely: "🥀",
      frustrated: "😤",
      irritated: "😠",
      nervous: "😟",
      worried: "😰",
      calm: "😌",
      indifferent: "😐",
    };

    return {
      topEmotion: topEmotion || "neutral",
      emoji: emojiMap[topEmotion] || "😐",
    };
  };

  const { topEmotion, emoji } = getRecentEmotionSummary();

  return (
    <div className="user-dashboard">
      <div className="dashboard-row">
        <div className="dashboard-card mood-card">
          <h2>Recent Emotion Overview</h2>
          <p>
            Based on your recent journals, you seem to be feeling mostly{" "}
            <strong>{topEmotion}</strong> {emoji}.
          </p>
          <Link
            to="/mood-tracking"
            className="view-trends-btn"
            aria-label="View Mood Trends"
            role="button"
          >
            View Mood Trends
          </Link>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card journal-card">
          <div className="card-header">
            <h2>Recent Journal Entries</h2>
            <Link to="/journals" className="view-all">
              View All
            </Link>
          </div>
          <JournalPreview journals={recentJournals} />
          <Link to="/journals" className="new-entry-btn">
            + New Journal Entry
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
