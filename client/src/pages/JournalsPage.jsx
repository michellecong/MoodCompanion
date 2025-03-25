import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JournalPreview from '../components/journal/JournalPreview';
import MoodTracker from '../components/journal/MoodTracker';
import './JournalsPage.css';

function JournalsPage() {
  const [journals, setJournals] = useState([]);
  const [newJournal, setNewJournal] = useState({ title: '', content: '', selectedMood: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user's journals from server
    const fetchJournals = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/journals', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setJournals(data.data);
      } catch (err) {
        setError('Error fetching journals');
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  const handleMoodSelect = (moodId) => {
    setNewJournal({ ...newJournal, selectedMood: moodId });
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    const { title, content, selectedMood } = newJournal;

    if (!title || !content) {
      setError('Title and Content cannot be empty');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/journals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();

      if (data.success) {
        setJournals([data.data, ...journals]);
        setNewJournal({ title: '', content: '', selectedMood: '' });
      } else {
        setError('Error creating journal');
      }
    } catch (err) {
      setError('Error creating journal');
    }
  };

  return (
    <div className="journals-page">
      <h2>My Journals</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <JournalPreview journals={journals} />

      <div className="create-journal">
        <h3>Create New Journal</h3>
        <form onSubmit={handleCreateJournal}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={newJournal.title}
              onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={newJournal.content}
              onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
              required
            />
          </div>

          <MoodTracker
            selectedMood={newJournal.selectedMood}
            onMoodSelect={handleMoodSelect}
          />

          <button type="submit" className="submit-button">Create Journal</button>
        </form>
      </div>
    </div>
  );
}

export default JournalsPage;
