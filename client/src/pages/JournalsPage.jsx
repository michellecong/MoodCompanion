import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import JournalPreview from "../components/journal/JournalPreview";
import "./JournalsPage.css";
import api from "../api/axios";

function JournalsPage() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
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

    if (!isLoading && isAuthenticated && localStorage.getItem("token")) {
      fetchJournals();
    }
  }, [isLoading, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    if (isLoading || !isAuthenticated) {
      setError("You must be logged in to create a journal.");
      return;
    }
  
    try {
      // 🔐 Get a fresh token just before request
      const token = await getAccessTokenSilently();
      localStorage.setItem("token", token); // optional: for other components
      console.log("✅ Fresh token fetched before POST:", token);
  
      const response = await api.post("/journals", {
        title: newJournal.title,
        content: newJournal.content,
      });
  
      if (response.data.success) {
        const newJournalData = response.data.data;
        setJournals((prevJournals) => [newJournalData, ...prevJournals]);
        setFilteredJournals((prevFiltered) => {
          if (!tempFilter.emotion && !tempFilter.startDate && !tempFilter.endDate) {
            return [newJournalData, ...prevFiltered];
          }
  
          let matchesFilter = true;
          if (tempFilter.emotion) {
            const topEmotion = newJournalData.emotionsDetected?.reduce(
              (prev, current) => (prev.score > current.score ? prev : current),
              {}
            );
            matchesFilter = topEmotion?.name === tempFilter.emotion;
          }
          if (tempFilter.startDate) {
            matchesFilter =
              matchesFilter &&
              newJournalData.createdAt.split("T")[0] >= tempFilter.startDate;
          }
          if (tempFilter.endDate) {
            matchesFilter =
              matchesFilter &&
              newJournalData.createdAt.split("T")[0] <= tempFilter.endDate;
          }
          return matchesFilter ? [newJournalData, ...prevFiltered] : prevFiltered;
        });
  
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
    if (isLoading || !isAuthenticated || !localStorage.getItem("token")) {
      setError("You must be logged in to delete a journal.");
      return;
    }

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
        if (isNaN(journalDate.getTime())) return false;

        const journalDateStr = journalDate.toISOString().split("T")[0];

        let afterStart = true;
        if (tempFilter.startDate) {
          afterStart = journalDateStr >= tempFilter.startDate;
        }

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
            <option value="excited">Excited</option>
            <option value="content">Content</option>
            <option value="depressed">Depressed</option>
            <option value="lonely">Lonely</option>
            <option value="frustrated">Frustrated</option>
            <option value="irritated">Irritated</option>
            <option value="nervous">Nervous</option>
            <option value="worried">Worried</option>
            <option value="calm">Calm</option>
            <option value="indifferent">Indifferent</option>
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
      <Link to="/mood-tracking" className="view-mood-btn">View Mood Tracking</Link>
    </div>
  );
}

export default JournalsPage;
