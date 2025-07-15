import React, { useState } from 'react';

const Journal: React.FC = () => {
  const [entry, setEntry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle journal entry submission
    console.log('Journal entry:', entry);
    setEntry('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Journal</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Today's Entry
            </label>
            <textarea
              id="journal-entry"
              rows={10}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Write about your thoughts, feelings, or anything on your mind..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              disabled={!entry.trim()}
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Journal;
