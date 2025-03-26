// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import './SingleJournalPage.css';

// function SingleJournalPage() {
//   const { id } = useParams();
//   const [journal, setJournal] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchJournal = async () => {
//       try {
//         const response = await fetch(`http://localhost:3000/api/journals/${id}`, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         const data = await response.json();
//         if (data.success) {
//           setJournal(data.data);
//         } else {
//           setError('Journal not found');
//         }
//       } catch (err) {
//         setError('Error fetching journal');
//       }
//     };

//     fetchJournal();
//   }, [id]);

//   if (error) {
//     return <p className="error">{error}</p>;
//   }

//   if (!journal) {
//     return <p>Loading...</p>;
//   }

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const getEmotionEmoji = (emotions) => {
//     if (!emotions || emotions.length === 0) return '';
    
//     const topEmotion = emotions.reduce((prev, current) =>
//       prev.score > current.score ? prev : current
//     );

//     const emojiMap = {
//       'joy': '😊',
//       'satisfaction': '😌',
//       'anxiety': '😰',
//       'fear': '😨',
//       'sadness': '😢',
//       'anger': '😠',
//     };
    
//     return emojiMap[topEmotion.name] || '';
//   };

//   return (
//     <div className="single-journal-page">
//       <Link to="/journals" className="back-link">Back to Journals</Link>

//       <h2>{journal.title}</h2>
//       <p className="journal-date">{formatDate(journal.createdAt)}</p>

//       <div className="journal-content">
//         <p>{journal.content}</p>
//       </div>

//       <div className="journal-emotions">
//         {getEmotionEmoji(journal.emotionsDetected)}
//       </div>

//       <div className="journal-feedback">
//         <h3>Feedback</h3>
//         <p>{journal.feedback}</p>
//       </div>
//     </div>
//   );
// }

// export default SingleJournalPage;


import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MoodTracker from '../components/journal/MoodTracker';
import './SingleJournalPage.css';

function SingleJournalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJournal, setEditedJournal] = useState({ title: '', content: '', selectedMood: '' });
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
          setEditedJournal({
            title: data.data.title,
            content: data.data.content,
            selectedMood: data.data.mood
          });
        } else {
          setError('Journal not found');
        }
      } catch (err) {
        setError('Error fetching journal');
      }
    };

    fetchJournal();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/journals/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedJournal.title,
          content: editedJournal.content,
          mood: editedJournal.selectedMood
        }),
      });
      const data = await response.json();

      if (data.success) {
        setJournal(data.data);
        setIsEditing(false);
      } else {
        setError('Error updating journal');
      }
    } catch (err) {
      setError('Error updating journal');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this journal?');
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3000/api/journals/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          navigate('/journals');
        } else {
          setError('Error deleting journal');
        }
      } catch (err) {
        setError('Error deleting journal');
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="single-journal-page">
      <Link to="/journals" className="back-link">Back to Journals</Link>

      {!isEditing ? (
        <>
          <h2>{journal.title}</h2>
          <p className="journal-date">{formatDate(journal.createdAt)}</p>
          <div className="journal-content">
            <p>{journal.content}</p>
          </div>
          <div className="journal-actions">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete} className="delete-btn">Delete</button>
          </div>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={editedJournal.title}
            onChange={(e) => setEditedJournal({...editedJournal, title: e.target.value})}
            required
          />
          <textarea
            value={editedJournal.content}
            onChange={(e) => setEditedJournal({...editedJournal, content: e.target.value})}
            required
          />
          <MoodTracker
            selectedMood={editedJournal.selectedMood}
            onMoodSelect={(moodId) => setEditedJournal({...editedJournal, selectedMood: moodId})}
          />
          <div className="edit-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SingleJournalPage;