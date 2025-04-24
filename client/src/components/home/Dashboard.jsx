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

    const emotionCounts = {};
    recentJournals.forEach((journal) => {
      if (journal.emotionsDetected?.length) {
        const topEmotion = journal.emotionsDetected.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );
        emotionCounts[topEmotion.name] =
          (emotionCounts[topEmotion.name] || 0) + 1;
      }
    });

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
      {/* Emotion Overview */}
      <section
        className="dashboard-row"
        role="region"
        aria-labelledby="emotion-overview-title"
      >
        <div className="dashboard-card mood-card">
          <h2 id="emotion-overview-title">Recent Emotion Overview</h2>
          <p>
            Based on your recent journals, you seem to be feeling mostly{" "}
            <strong>{topEmotion}</strong> {emoji}.
          </p>
          <Link
            to="/mood-tracking"
            className="view-trends-btn"
            aria-label="View your mood trends"
          >
            View Mood Trends
          </Link>
        </div>
      </section>

      {/* Journal Entries */}
      <section
        className="dashboard-row"
        role="region"
        aria-labelledby="journal-entries-title"
      >
        <div className="dashboard-card journal-card">
          <div className="card-header">
            <h2 id="journal-entries-title">Recent Journal Entries</h2>
            <Link
              to="/journals"
              className="view-all"
              aria-label="View all journal entries"
            >
              View All
            </Link>
          </div>
          <JournalPreview journals={recentJournals} />
          <Link
            to="/journals"
            className="new-entry-btn"
            aria-label="Create a new journal entry"
          >
            + New Journal Entry
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
