const express = require('express');
const { check } = require('express-validator');
const {
  getJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
  getJournalStats
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Journal = require('../models/Journal');

const router = express.Router();

// All routes protected
router.use(protect);

// Advanced results with filtering, pagination, etc.
router.get(
  '/',
  advancedResults(Journal, [
    { path: 'user', select: 'username avatar' },
    { path: 'mood', select: 'mood intensity' }
  ], {
    path: 'mood',
    select: 'mood intensity'
  }),
  getJournals
);

// Stats route
router.get('/stats', getJournalStats);

// Standard CRUD routes
router.post(
  '/',
  [
    check('content', 'Content is required').not().isEmpty(),
    check('mood', 'Mood rating (1-5) is required').isInt({ min: 1, max: 5 })
  ],
  createJournal
);

router
  .route('/:id')
  .get(getJournal)
  .put(
    [
      check('content', 'Content is required').optional().not().isEmpty(),
      check('mood', 'Mood must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
    ],
    updateJournal
  )
  .delete(deleteJournal);

module.exports = router;
