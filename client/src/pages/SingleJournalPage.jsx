import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./SingleJournalPage.css";

function SingleJournalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJournal, setEditedJournal] = useState({
    title: "",
    content: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await api.get(`/journals/${id}`);
        if (response.data.success) {
          setJournal(response.data.data);
          setEditedJournal({
            title: response.data.data.title,
            content: response.data.data.content,
          });
        } else {
          setError("Journal not found");
        }
      } catch (err) {
        console.error("Error fetching journal:", err);
        setError("Error fetching journal");
      }
    };

    fetchJournal();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/journals/${id}`, {
        title: editedJournal.title,
        content: editedJournal.content,
      });

      if (response.data.success) {
        setJournal(response.data.data);
        setIsEditing(false);
      } else {
        setError("Error updating journal");
      }
    } catch (err) {
      console.error("Error updating journal:", err);
      setError("Error updating journal");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this journal?"
    );
    if (confirmDelete) {
      try {
        const response = await api.delete(`/journals/${id}`);

        if (response.data.success) {
          navigate("/journals");
        } else {
          setError("Error deleting journal");
        }
      } catch (err) {
        console.error("Error deleting journal:", err);
        setError("Error deleting journal");
      }
    }
  };

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!journal) {
    return <p>Loading...</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEmotionEmoji = (emotions) => {
    if (!emotions || emotions.length === 0) return "";

    const topEmotion = emotions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    const emojiMap = {
      joy: "😊",
      satisfaction: "😌",
      anxiety: "😰",
      fear: "😨",
      sadness: "😢",
      anger: "😠",
      neutral: "😐",
    };

    return emojiMap[topEmotion.name] || "";
  };

  return (
    <div className="single-journal-page">
      <Link to="/journals" className="back-link">
        Back to Journals
      </Link>

      {!isEditing ? (
        <>
          <h2>{journal.title}</h2>
          <p className="journal-date">{formatDate(journal.createdAt)}</p>
          <div className="journal-content">
            <p>{journal.content}</p>
          </div>
          <div className="journal-mood">
            {journal.emotionsDetected.length > 0 && (
              <>
                <p>
                  AI-detected emotions:{" "}
                  {journal.emotionsDetected
                    .map((e) => `${e.name} (${(e.score * 100).toFixed(1)}%)`)
                    .join(", ")}
                </p>
                <p>Feedback: {journal.feedback}</p>
              </>
            )}
          </div>
          <div className="journal-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete} className="delete-btn">
              Delete
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={editedJournal.title}
            onChange={(e) =>
              setEditedJournal({ ...editedJournal, title: e.target.value })
            }
            required
          />
          <textarea
            value={editedJournal.content}
            onChange={(e) =>
              setEditedJournal({ ...editedJournal, content: e.target.value })
            }
            required
          />
          <div className="edit-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SingleJournalPage;
