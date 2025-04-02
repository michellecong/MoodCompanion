import { useState, useEffect } from "react";
import JournalPreview from "../components/journal/JournalPreview";
import "./JournalsPage.css";
import api from "../api/axios";

function JournalsPage() {
  const [newJournal, setNewJournal] = useState({
    title: "",
    content: "",
  });
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [tempFilter, setTempFilter] = useState({
    emotion: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await api.get("/journals");
        if (response.data.success) {
          setJournals(response.data.data);
          setFilteredJournals(response.data.data);
        } else {
          setError("Failed to fetch journals");
        }
      } catch (err) {
        setError("Error fetching journals");
        console.error("Error fetching journals:", err);
      }
    };

    fetchJournals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await api.post("/journals", {
        title: newJournal.title,
        content: newJournal.content,
      });

      if (response.data.success) {
        setJournals([response.data.data, ...journals]);
        setNewJournal({ title: "", content: "" });
        setError(null);
      } else {
        setError("Error creating journal");
      }
    } catch (err) {
      setError("Error creating journal");
      console.error("Error creating journal:", err);
    }
  };

  const handleDelete = async (journalId) => {
    try {
      const response = await api.delete(`/journals/${journalId}`);

      if (response.data.success) {
        setJournals(journals.filter((journal) => journal._id !== journalId));
        setFilteredJournals(
          filteredJournals.filter((journal) => journal._id !== journalId)
        );
      } else {
        setError("Error deleting journal");
      }
    } catch (err) {
      setError("Error deleting journal");
      console.error("Error deleting journal:", err);
    }
  };

  const validateForm = () => {
    const { title, content } = newJournal;
    if (!title.trim()) {
      setError("Title cannot be empty");
      return false;
    }
    if (!content.trim()) {
      setError("Content cannot be empty");
      return false;
    }
    return true;
  };

  const handleTempFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    let filtered = [...journals];

    if (tempFilter.emotion) {
      filtered = filtered.filter((journal) => {
        if (!journal.emotionsDetected || journal.emotionsDetected.length === 0)
          return false;
        const topEmotion = journal.emotionsDetected.reduce((prev, current) =>
          prev.score > current.score ? prev : current
        );
        return topEmotion.name === tempFilter.emotion;
      });
    }

    if (tempFilter.startDate || tempFilter.endDate) {
      filtered = filtered.filter((journal) => {
        const journalDate = new Date(journal.createdAt);
        // ensure journalDate is a valid date
        if (isNaN(journalDate.getTime())) return false;

        // convert journalDate to YYYY-MM-DD format
        const journalDateStr = journalDate.toISOString().split("T")[0];

        // if there is startDate, compare if greater than or equal
        let afterStart = true;
        if (tempFilter.startDate) {
          afterStart = journalDateStr >= tempFilter.startDate;
        }

        // if there is endDate, compare if less than or equal
        let beforeEnd = true;
        if (tempFilter.endDate) {
          beforeEnd = journalDateStr <= tempFilter.endDate;
        }

        return afterStart && beforeEnd;
      });
    }

    setFilteredJournals(filtered);
  };

  const handleResetFilter = () => {
    setTempFilter({
      emotion: "",
      startDate: "",
      endDate: "",
    });
    setFilteredJournals(journals);
  };

  return (
    <div className="journals-page">
      <h1>My Journals</h1>

      <form onSubmit={handleSubmit} className="create-journal">
        <div className="form-group">
          <input
            type="text"
            placeholder="Title"
            value={newJournal.title}
            onChange={(e) =>
              setNewJournal({ ...newJournal, title: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Write your journal entry..."
            value={newJournal.content}
            onChange={(e) =>
              setNewJournal({ ...newJournal, content: e.target.value })
            }
          />
        </div>
        <button type="submit" className="submit-button">
          Create Journal
        </button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="filter-section">
        <div className="filter-group">
          <label>Emotion:</label>
          <select
            name="emotion"
            value={tempFilter.emotion}
            onChange={handleTempFilterChange}
          >
            <option value="">All Emotions</option>
            <option value="joy">Joy</option>
            <option value="sadness">Sadness</option>
            <option value="anger">Anger</option>
            <option value="anxiety">Anxiety</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Start:</label>
          <input
            type="date"
            name="startDate"
            value={tempFilter.startDate}
            onChange={handleTempFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>End:</label>
          <input
            type="date"
            name="endDate"
            value={tempFilter.endDate}
            onChange={handleTempFilterChange}
          />
        </div>
        <button
          type="button"
          className="filter-button"
          onClick={handleApplyFilter}
        >
          Filter
        </button>
        <button
          type="button"
          className="reset-button"
          onClick={handleResetFilter}
        >
          Reset
        </button>
      </div>

      {filteredJournals ? (
        <JournalPreview journals={filteredJournals} onDelete={handleDelete} />
      ) : (
        <p>Loading journals...</p>
      )}
    </div>
  );
}

export default JournalsPage;
