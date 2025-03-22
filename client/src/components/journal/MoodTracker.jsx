import { useState } from 'react';
import './MoodTracker.css';

function MoodTracker({ onMoodSelect, selectedMood }) {
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'angry', emoji: '😠', label: 'Angry' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' }
  ];

  return (
    <div className="mood-tracker">
      <div className="mood-options">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
            onClick={() => onMoodSelect(mood.id)}
          >
            <div className="mood-emoji">{mood.emoji}</div>
            <div className="mood-label">{mood.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodTracker;