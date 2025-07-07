const express = require('express');
const { check } = require('express-validator');
const {
  getMoods,
  getMood,
  createMood,
  updateMood,
  deleteMood,
  getMoodStats,
  getMoodInsights
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Mood = require('../models/Mood');

const router = express.Router();

// All routes protected
router.use(protect);

// Advanced results with filtering, pagination, etc.
router.get(
  '/',
  advancedResults(Mood, [
    { path: 'user', select: 'username avatar' }
  ]),
  getMoods
);

// Stats and insights routes
router.get('/stats', getMoodStats);
router.get('/insights', getMoodInsights);

// Standard CRUD routes
router.post(
  '/',
  [
    check('mood', 'Mood is required').isIn([
      'happy', 'sad', 'anxious', 'angry', 'calm', 'excited', 'grateful', 'tired', 'neutral'
    ]),
    check('intensity', 'Intensity is required and must be between 1 and 10')
      .isInt({ min: 1, max: 10 })
  ],
  createMood
);

router
  .route('/:id')
  .get(getMood)
  .put(
    [
      check('mood', 'Invalid mood')
        .optional()
        .isIn(['happy', 'sad', 'anxious', 'angry', 'calm', 'excited', 'grateful', 'tired', 'neutral']),
      check('intensity', 'Intensity must be between 1 and 10')
        .optional()
        .isInt({ min: 1, max: 10 })
    ],
    updateMood
  )
  .delete(deleteMood);

module.exports = router;
