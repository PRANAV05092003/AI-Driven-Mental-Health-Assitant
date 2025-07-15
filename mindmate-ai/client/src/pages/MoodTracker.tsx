import React, { useState } from 'react';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😨', label: 'Anxious' },
];

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    
    // Handle mood submission
    console.log('Mood:', selectedMood);
    console.log('Note:', note);
    setSelectedMood(null);
    setNote('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Mood Tracker</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">How are you feeling today?</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                    selectedMood === mood.emoji
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedMood(mood.emoji)}
                >
                  <span className="text-4xl mb-1">{mood.emoji}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="mood-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add a note (optional)
            </label>
            <textarea
              id="mood-note"
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={!selectedMood}
            >
              Save Mood
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoodTracker;
