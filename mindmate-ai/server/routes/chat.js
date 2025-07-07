const express = require('express');
const { check } = require('express-validator');
const { chat, analyzeText } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes protected
router.use(protect);

// @route   POST /api/chat
// @desc    Chat with AI
// @access  Private
router.post(
  '/',
  [
    check('message', 'Message is required').not().isEmpty(),
    check('context', 'Context must be an array').optional().isArray()
  ],
  chat
);

// @route   POST /api/chat/analyze
// @desc    Analyze text sentiment
// @access  Private
router.post(
  '/analyze',
  [
    check('text', 'Text is required').not().isEmpty()
  ],
  analyzeText
);

module.exports = router;
