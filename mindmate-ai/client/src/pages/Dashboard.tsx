import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your dashboard widgets here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Welcome Back!</h2>
          <p className="text-gray-600 dark:text-gray-300">Your mental health journey starts here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
