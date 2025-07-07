const Journal = require('../models/Journal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all journal entries
// @route     GET /api/journal
// @access    Private
exports.getJournals = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single journal entry
// @route     GET /api/journal/:id
// @access    Private
exports.getJournal = asyncHandler(async (req, res, next) => {
  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    return next(
      new ErrorResponse(`Journal not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is journal owner
  if (journal.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this journal`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: journal
  });
});

// @desc      Create new journal entry
// @route     POST /api/journal
// @access    Private
exports.createJournal = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const journal = await Journal.create(req.body);

  res.status(201).json({
    success: true,
    data: journal
  });
});

// @desc      Update journal entry
// @route     PUT /api/journal/:id
// @access    Private
exports.updateJournal = asyncHandler(async (req, res, next) => {
  let journal = await Journal.findById(req.params.id);

  if (!journal) {
    return next(
      new ErrorResponse(`Journal not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is journal owner
  if (journal.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this journal`,
        401
      )
    );
  }

  journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: journal
  });
});

// @desc      Delete journal entry
// @route     DELETE /api/journal/:id
// @access    Private
exports.deleteJournal = asyncHandler(async (req, res, next) => {
  const journal = await Journal.findById(req.params.id);

  if (!journal) {
    return next(
      new ErrorResponse(`Journal not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is journal owner
  if (journal.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this journal`,
        401
      )
    );
  }

  await journal.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get journal stats
// @route     GET /api/journal/stats
// @access    Private
exports.getJournalStats = asyncHandler(async (req, res, next) => {
  // Get mood distribution
  const moodStats = await Journal.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: '$emotion',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get journal count by date
  const journalTimeline = await Journal.aggregate([
    {
      $match: { user: req.user._id }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        avgMood: { $avg: '$mood' }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $limit: 30
    }
  ]);

  // Get most used tags
  const tagStats = await Journal.aggregate([
    {
      $match: { user: req.user._id, tags: { $exists: true, $ne: [] } }
    },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      moodStats,
      journalTimeline,
      tagStats
    }
  });
});
