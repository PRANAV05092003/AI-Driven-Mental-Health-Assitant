const Mood = require('../models/Mood');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all mood entries
// @route     GET /api/mood
// @access    Private
exports.getMoods = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single mood entry
// @route     GET /api/mood/:id
// @access    Private
exports.getMood = asyncHandler(async (req, res, next) => {
  const mood = await Mood.findById(req.params.id);

  if (!mood) {
    return next(
      new ErrorResponse(`Mood entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is mood entry owner
  if (mood.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this mood entry`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: mood
  });
});

// @desc      Create new mood entry
// @route     POST /api/mood
// @access    Private
exports.createMood = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const mood = await Mood.create(req.body);

  res.status(201).json({
    success: true,
    data: mood
  });
});

// @desc      Update mood entry
// @route     PUT /api/mood/:id
// @access    Private
exports.updateMood = asyncHandler(async (req, res, next) => {
  let mood = await Mood.findById(req.params.id);

  if (!mood) {
    return next(
      new ErrorResponse(`Mood entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is mood entry owner
  if (mood.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this mood entry`,
        401
      )
    );
  }

  mood = await Mood.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: mood
  });
});

// @desc      Delete mood entry
// @route     DELETE /api/mood/:id
// @access    Private
exports.deleteMood = asyncHandler(async (req, res, next) => {
  const mood = await Mood.findById(req.params.id);

  if (!mood) {
    return next(
      new ErrorResponse(`Mood entry not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is mood entry owner
  if (mood.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this mood entry`,
        401
      )
    );
  }

  await mood.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get mood statistics
// @route     GET /api/mood/stats
// @access    Private
exports.getMoodStats = asyncHandler(async (req, res, next) => {
  // Get mood distribution
  const moodDistribution = await Mood.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$intensity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get mood trend over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const moodTimeline = await Mood.aggregate([
    {
      $match: {
        user: req.user._id,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        avgIntensity: { $avg: '$intensity' },
        count: { $sum: 1 },
        moods: { $push: '$mood' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get mood by day of week
  const moodByDay = await Mood.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        avgIntensity: { $avg: '$intensity' },
        count: { $sum: 1 },
        moods: { $push: '$mood' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get mood by time of day
  const moodByHour = await Mood.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        avgIntensity: { $avg: '$intensity' },
        count: { $sum: 1 },
        moods: { $push: '$mood' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get activities correlation
  const activitiesCorrelation = await Mood.aggregate([
    {
      $match: {
        user: req.user._id,
        activities: { $exists: true, $not: { $size: 0 } }
      }
    },
    { $unwind: '$activities' },
    {
      $group: {
        _id: '$activities',
        avgIntensity: { $avg: '$intensity' },
        count: { $sum: 1 },
        moods: { $push: '$mood' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      moodDistribution,
      moodTimeline,
      moodByDay,
      moodByHour,
      activitiesCorrelation
    }
  });
});

// @desc      Get current mood insights
// @route     GET /api/mood/insights
// @access    Private
exports.getMoodInsights = asyncHandler(async (req, res, next) => {
  // Get recent moods (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentMoods = await Mood.find({
    user: req.user._id,
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: -1 });

  if (recentMoods.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        message: 'No mood entries found in the last 7 days',
        suggestions: [
          'Start by adding your first mood entry to track your emotional well-being.'
        ]
      }
    });
  }

  // Calculate average mood intensity
  const avgIntensity = 
    recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) / recentMoods.length;

  // Count mood occurrences
  const moodCounts = recentMoods.reduce((acc, mood) => {
    acc[mood.mood] = (acc[mood.mood] || 0) + 1;
    return acc;
  }, {});

  // Get most common mood
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];

  // Generate insights
  const insights = [];
  const suggestions = [];

  // Mood trend insight
  const firstMood = recentMoods[recentMoods.length - 1];
  const lastMood = recentMoods[0];
  
  if (firstMood && lastMood) {
    const moodChange = lastMood.intensity - firstMood.intensity;
    if (Math.abs(moodChange) > 2) {
      insights.push(`Your mood has ${moodChange > 0 ? 'improved' : 'declined'} significantly over the past week.`);
    }
  }

  // Activity correlation insight
  const activities = recentMoods.flatMap(mood => mood.activities || []);
  if (activities.length > 0) {
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {});
    
    const mostCommonActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0][0];
    insights.push(`You've been engaging in ${mostCommonActivity} frequently.`);
    
    // Add activity-specific suggestions
    if (mostCommonActivity === 'exercise') {
      suggestions.push('Keep up with your exercise routine! Regular physical activity is great for mental health.');
    } else if (mostCommonActivity === 'meditation') {
      suggestions.push('Your meditation practice is helping build mindfulness. Consider trying different techniques.');
    }
  }

  // Mood-specific suggestions
  if (mostCommonMood === 'anxious') {
    suggestions.push(
      'Try deep breathing exercises to help manage anxiety.',
      'Consider journaling about what\'s causing your anxiety to better understand and process your feelings.'
    );
  } else if (mostCommonMood === 'sad') {
    suggestions.push(
      'Reach out to a friend or loved one for support.',
      'Engage in activities you usually enjoy, even if you don\'t feel like it right now.'
    );
  } else if (mostCommonMood === 'happy') {
    suggestions.push(
      'Share your positive energy with others!',
      'Take a moment to reflect on what\'s contributing to your happiness.'
    );
  }

  // General suggestions based on mood intensity
  if (avgIntensity > 7) {
    suggestions.push('Your high intensity moods suggest you might benefit from stress-reduction techniques.');
  } else if (avgIntensity < 4) {
    suggestions.push('Consider activities that energize you to help lift your mood.');
  }

  res.status(200).json({
    success: true,
    data: {
      recentMood: recentMoods[0],
      moodTrend: recentMoods.map(m => ({
        date: m.createdAt,
        mood: m.mood,
        intensity: m.intensity
      })),
      stats: {
        averageIntensity: parseFloat(avgIntensity.toFixed(2)),
        mostCommonMood,
        moodCounts,
        totalEntries: recentMoods.length
      },
      insights,
      suggestions: [...new Set(suggestions)].slice(0, 3) // Remove duplicates and limit to 3
    }
  });
});
