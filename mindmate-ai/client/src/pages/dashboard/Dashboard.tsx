import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  ChartBarIcon, 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon,
  FaceSmileIcon,
  LightBulbIcon,
  MusicalNoteIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Mock data for the dashboard
const stats = [
  { name: 'Current Streak', value: '7 days', icon: ClockIcon, change: '+2', changeType: 'positive' },
  { name: 'Mood Average', value: '7.2/10', icon: FaceSmileIcon, change: '+0.5', changeType: 'positive' },
  { name: 'Journal Entries', value: '12', icon: BookOpenIcon, change: '+3', changeType: 'positive' },
  { name: 'Chat Sessions', value: '8', icon: ChatBubbleLeftRightIcon, change: '+5', changeType: 'positive' },
];

const recentActivities = [
  { id: 1, type: 'journal', title: 'Morning Reflection', time: '2 hours ago', icon: BookOpenIcon },
  { id: 2, type: 'mood', title: 'Mood Check-in', time: '5 hours ago', icon: FaceSmileIcon },
  { id: 3, type: 'chat', title: 'Therapy Session', time: '1 day ago', icon: ChatBubbleLeftRightIcon },
  { id: 4, type: 'insight', title: 'New Insight', time: '2 days ago', icon: LightBulbIcon },
];

const quickActions = [
  { name: 'New Journal Entry', description: 'Write about your thoughts and feelings', icon: BookOpenIcon, to: '/journal/new' },
  { name: 'Check-in Mood', description: 'Log your current emotional state', icon: FaceSmileIcon, to: '/mood/check-in' },
  { name: 'Chat with MindMate', description: 'Talk to your AI companion', icon: ChatBubbleLeftRightIcon, to: '/chat' },
  { name: 'View Insights', description: 'See your progress and patterns', icon: LightBulbIcon, to: '/insights' },
];

const moodData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Mood',
      data: [6, 7, 5, 8, 7, 8, 9],
      fill: true,
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderColor: 'rgba(79, 70, 229, 1)',
      tension: 0.4,
    },
  ],
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const notify = useNotification();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [isLoading, setIsLoading] = useState(true);
  const [moodChart, setMoodChart] = useState<any>(null);

  // Lazy load the chart component
  useEffect(() => {
    const loadChart = async () => {
      try {
        // In a real app, you would fetch data from your API here
        // For now, we're using mock data
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        notify.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    loadChart();
  }, [notify]);

  // Dynamically import the chart component to reduce bundle size
  useEffect(() => {
    const loadChart = async () => {
      const { Line } = await import('react-chartjs-2');
      setMoodChart(() => Line);
    };

    loadChart();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Here's what's happening with your mental wellness today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              {stat.change && (
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stat.changeType === 'positive'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {stat.changeType === 'positive' ? '↑' : '↓'} {stat.change}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    from last week
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Chart */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Mood Trend</h2>
            <div className="flex items-center">
              <select
                id="time-range"
                name="time-range"
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                defaultValue="week"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                type="button"
                className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Refresh</span>
              </button>
            </div>
          </div>
          <div className="mt-6 h-64">
            {moodChart ? (
              <moodChart
                data={moodData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: { size: 14 },
                      bodyFont: { size: 14 },
                      displayColors: false,
                      callbacks: {
                        label: (context: any) => {
                          return `Mood: ${context.parsed.y}/10`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        stepSize: 2,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart...</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={action.name}
                to={action.to}
                className="block p-4 bg-white dark:bg-gray-800 shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-2">
                    <action.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{action.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <activity.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {activity.type === 'journal' && 'You wrote a new journal entry'}
                      {activity.type === 'mood' && 'You logged your current mood'}
                      {activity.type === 'chat' && 'You had a conversation with MindMate'}
                      {activity.type === 'insight' && 'New insights available based on your data'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-6 py-4 text-center">
              <Link
                to="/activities"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all activities
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Mood Tips */}
        <motion.div 
          className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                <LightBulbIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="ml-3 text-lg font-medium text-white">Daily Tip</h2>
            </div>
            <div className="mt-4">
              <p className="text-indigo-100">
                Practicing gratitude can improve your mood and overall well-being. 
                Try writing down three things you're grateful for today.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try it now
              </button>
            </div>
          </div>
          <div className="bg-indigo-700 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MusicalNoteIcon className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-200">Mindful Moment</p>
                <p className="text-xs text-indigo-300">Try our 5-minute guided meditation</p>
              </div>
              <div className="ml-auto">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
