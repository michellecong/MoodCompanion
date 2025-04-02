// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import JournalPreview from '../components/journal/JournalPreview';
// import MoodTracker from '../components/journal/MoodTracker';
// import './JournalsPage.css';

// function JournalsPage() {
//   const [journals, setJournals] = useState([]);
//   const [newJournal, setNewJournal] = useState({ title: '', content: '' });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchDate, setSearchDate] = useState('');
//   const [searchMood, setSearchMood] = useState('');

//   useEffect(() => {
//     const fetchJournals = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/api/journals', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         const data = await response.json();
//         if (data.success) {
//           setJournals(data.data);
//         } else {
//           setError('Failed to fetch journals');
//         }
//       } catch (err) {
//         setError('Error fetching journals');
//       }
//     };

//     fetchJournals();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const response = await fetch('http://localhost:3000/api/journals', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           title: newJournal.title,
//           content: newJournal.content,
//         }),
//       });
//       const data = await response.json();

//       if (data.success) {
//         setJournals([data.data, ...journals]);
//         setNewJournal({ title: '', content: '' });
//         setError(null);
//       } else {
//         setError('Error creating journal');
//       }
//     } catch (err) {
//       setError('Error creating journal');
//     }
//   };

//   const handleDelete = async (journalId) => {
//     try {
//       const response = await fetch(`http://localhost:3000/api/journals/${journalId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });
//       const data = await response.json();

//       if (data.success) {
//         setJournals(journals.filter(journal => journal._id !== journalId));
//       } else {
//         setError('Error deleting journal');
//       }
//     } catch (err) {
//       setError('Error deleting journal');
//     }
//   };

//   const validateForm = () => {
//     const { title, content } = newJournal;
//     if (!title.trim()) {
//       setError('Title cannot be empty');
//       return false;
//     }
//     if (!content.trim()) {
//       setError('Content cannot be empty');
//       return false;
//     }
//     return true;
//   };

//   // const handleCreateJournal = async (e) => {
//   //   e.preventDefault();
    
//   //   if (!validateForm()) return;

//   //   try {
//   //     const response = await fetch('http://localhost:3000/api/journals', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         title: newJournal.title,
//   //         content: newJournal.content,
//   //         mood: newJournal.selectedMood
//   //       }),
//   //     });
//   //     const data = await response.json();

//   //     if (data.success) {
//   //       setJournals([data.data, ...journals]);
//   //       // Reset form
//   //       setNewJournal({ title: '', content: '', selectedMood: '' });
//   //       setError(null);
//   //     } else {
//   //       setError(data.message || 'Error creating journal');
//   //     }
//   //   } catch (err) {
//   //     setError('Network error. Please try again.');
//   //   }
//   // };

//   // const handleSearch = () => {
//   //   const queryParts = [];
//   //   if (searchDate) queryParts.push(`date=${searchDate}`);
//   //   if (searchMood) queryParts.push(`mood=${searchMood}`);
//   //   const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
//   //   fetchJournals(queryString);
//   // };

//   // const handleDeleteJournal = async (journalId) => {
//   //   const confirmDelete = window.confirm('Are you sure you want to delete this journal?');
//   //   if (confirmDelete) {
//   //     try {
//   //       const response = await fetch(`http://localhost:3000/api/journals/${journalId}`, {
//   //         method: 'DELETE',
//   //         headers: {
//   //           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//   //         },
//   //       });
//   //       const data = await response.json();

//   //       if (data.success) {
//   //         setJournals(journals.filter(journal => journal._id !== journalId));
//   //       } else {
//   //         setError('Error deleting journal');
//   //       }
//   //     } catch (err) {
//   //       setError('Network error. Please try again.');
//   //     }
//   //   }
//   // };

//   return (
//     <div className="journals-page">
//       <h2>My Journals</h2>

//       {loading && <p>Loading...</p>}
//       {error && <p className="error">{error}</p>}

//       <div className="search-section">
//         <input
//           type="date"
//           value={searchDate}
//           onChange={(e) => setSearchDate(e.target.value)}
//           placeholder="Search by date"
//         />
//         <select 
//           value={searchMood} 
//           onChange={(e) => setSearchMood(e.target.value)}
//         >
//           <option value="">All Moods</option>
//           <option value="happy">Happy</option>
//           <option value="calm">Calm</option>
//           <option value="sad">Sad</option>
//           <option value="angry">Angry</option>
//           <option value="anxious">Anxious</option>
//         </select>
//         <button onClick={handleSearch}>Search</button>
//       </div>

//       <JournalPreview 
//         journals={journals} 
//         onDelete={handleDeleteJournal} 
//       />

//       <div className="create-journal">
//         <h3>Create New Journal</h3>
//         <form onSubmit={handleCreateJournal}>
//           <div className="form-group">
//             <label htmlFor="title">Title</label>
//             <input
//               type="text"
//               id="title"
//               value={newJournal.title}
//               onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="content">Content</label>
//             <textarea
//               id="content"
//               value={newJournal.content}
//               onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
//               required
//             />
//           </div>

//           <MoodTracker
//             selectedMood={newJournal.selectedMood}
//             onMoodSelect={handleMoodSelect}
//           />

//           <button type="submit" className="submit-button">Create Journal</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default JournalsPage;
import { useState, useEffect } from 'react';
import JournalPreview from '../components/journal/JournalPreview';
import './JournalsPage.css';

function JournalsPage() {
  const [newJournal, setNewJournal] = useState({
    title: '',
    content: '',
  });
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/journals', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setJournals(data.data);
        } else {
          setError('Failed to fetch journals');
        }
      } catch (err) {
        setError('Error fetching journals');
      }
    };

    fetchJournals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:3000/api/journals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newJournal.title,
          content: newJournal.content,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setJournals([data.data, ...journals]);
        setNewJournal({ title: '', content: '' });
        setError(null);
      } else {
        setError('Error creating journal');
      }
    } catch (err) {
      setError('Error creating journal');
    }
  };

  const handleDelete = async (journalId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/journals/${journalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setJournals(journals.filter(journal => journal._id !== journalId));
      } else {
        setError('Error deleting journal');
      }
    } catch (err) {
      setError('Error deleting journal');
    }
  };

  const validateForm = () => {
    const { title, content } = newJournal;
    if (!title.trim()) {
      setError('Title cannot be empty');
      return false;
    }
    if (!content.trim()) {
      setError('Content cannot be empty');
      return false;
    }
    return true;
  };

  return (
    <div className="journals-page">
      <h1>My Journals</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={newJournal.title}
          onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
        />
        <textarea
          placeholder="Write your journal entry..."
          value={newJournal.content}
          onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
        />
        <button type="submit">Create Journal</button>
      </form>
      {error && <p className="error">{error}</p>}
      <JournalPreview journals={journals} onDelete={handleDelete} />
    </div>
  );
}

export default JournalsPage;