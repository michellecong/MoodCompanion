// import { Link } from 'react-router-dom';
// import './JournalPreview.css';

// function JournalPreview({ journals }) {
//   if (!journals || journals.length === 0) {
//     return <p className="no-journals">No journal entries yet. Create your first one!</p>;
//   }

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const getEmotionEmoji = (emotions) => {
//     if (!emotions || emotions.length === 0) return '';
    
//     // Find the emotion with the highest score
//     const topEmotion = emotions.reduce((prev, current) => 
//       prev.score > current.score ? prev : current
//     );
    
//     // Map emotion to emoji
//     const emojiMap = {
//       'joy': '😊',
//       'satisfaction': '😌',
//       'anxiety': '😰',
//       'fear': '😨',
//       'sadness': '😢',
//       'anger': '😠'
//     };
    
//     return emojiMap[topEmotion.name] || '';
//   };

//   return (
//     <div className="journal-preview">
//       {journals.map((journal) => (
//         <Link to={`/journal/${journal._id}`} key={journal._id} className="journal-card">
//           <div className="journal-header">
//             <h3>{journal.title}</h3>
//             <span className="journal-date">{formatDate(journal.createdAt)}</span>
//           </div>
//           <p className="journal-excerpt">{journal.content.slice(0, 100)}...</p>
//           <div className="journal-emotions">
//             {getEmotionEmoji(journal.emotionsDetected)}
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }

// export default JournalPreview;


import { Link } from 'react-router-dom';
import './JournalPreview.css';

function JournalPreview({ journals, onDelete }) {
  if (!journals || journals.length === 0) {
    return <p className="no-journals">No journal entries yet. Create your first one!</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      'anger': '😠'
    };
    
    return emojiMap[topEmotion.name] || '';
  };

  return (
    <div className="journal-preview">
      {journals.map((journal) => (
        <div key={journal._id} className="journal-card-container">
          <Link to={`/journal/${journal._id}`} className="journal-card">
            <div className="journal-header">
              <h3>{journal.title}</h3>
              <span className="journal-date">{formatDate(journal.createdAt)}</span>
            </div>
            <p className="journal-excerpt">{journal.content.slice(0, 100)}...</p>
            <div className="journal-emotions">
              {getEmotionEmoji(journal.emotionsDetected)}
            </div>
          </Link>
          {onDelete && (
            <button 
              className="delete-journal-btn" 
              onClick={() => onDelete(journal._id)}
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default JournalPreview;