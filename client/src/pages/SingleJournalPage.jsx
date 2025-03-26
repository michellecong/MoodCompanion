import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SingleJournalPage.css';

function SingleJournalPage() {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/journals/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setJournal(data.data);
        } else {
          setError('Journal not found');
        }
      } catch (err) {
        setError('Error fetching journal');
      }
    };

    fetchJournal();
  }, [id]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!journal) {
    return <p>Loading...</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEmotionEmoji = (emotions) => {
    if (!emotions || emotions.length === 0) return '';
    
    const topEmotion = emotions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    const emojiMap = {
      'joy': '😊',
      'satisfaction': '😌',
      'anxiety': '😰',
      'fear': '😨',
      'sadness': '😢',
      'anger': '😠',
    };
    
    return emojiMap[topEmotion.name] || '';
  };

  return (
    <div className="single-journal-page">
      <Link to="/journals" className="back-link">Back to Journals</Link>

      <h2>{journal.title}</h2>
      <p className="journal-date">{formatDate(journal.createdAt)}</p>

      <div className="journal-content">
        <p>{journal.content}</p>
      </div>

      <div className="journal-emotions">
        {getEmotionEmoji(journal.emotionsDetected)}
      </div>

      <div className="journal-feedback">
        <h3>Feedback</h3>
        <p>{journal.feedback}</p>
      </div>
    </div>
  );
}

export default SingleJournalPage;
