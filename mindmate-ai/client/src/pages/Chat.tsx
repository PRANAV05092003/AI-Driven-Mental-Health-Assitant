import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Chat</h1>
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {/* Chat messages will go here */}
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Start a conversation with your AI companion
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
