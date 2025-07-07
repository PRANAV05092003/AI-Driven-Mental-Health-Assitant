const OpenAI = require('openai');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Mood = require('../models/Mood');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc      Chat with AI
// @route     POST /api/chat
// @access    Private
exports.chat = asyncHandler(async (req, res, next) => {
  const { message, context = [] } = req.body;
  const userId = req.user.id;

  if (!message) {
    return next(new ErrorResponse('Please provide a message', 400));
  }

  try {
    // Get user's recent moods for context
    const recentMoods = await Mood.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Create system message with user context
    const systemMessage = {
      role: 'system',
      content: `You are MindMate, a compassionate AI mental health companion. You are talking to ${req.user.username}. 
      ${recentMoods.length > 0 ? `Their recent mood has been ${recentMoods[0].mood} with an intensity of ${recentMoods[0].intensity}/10.` : ''}
      Be empathetic, supportive, and non-judgmental. Help them process their thoughts and feelings.`
    };

    // Prepare messages array with system message and conversation history
    const messages = [systemMessage, ...context, { role: 'user', content: message }];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const aiResponse = completion.choices[0].message.content;

    // Analyze sentiment of the conversation
    const sentiment = await analyzeSentiment(message);
    
    // If the sentiment is very negative, suggest resources
    let resources = [];
    if (sentiment.score < -0.5) {
      resources = await getSupportResources(sentiment);
    }

    res.status(200).json({
      success: true,
      response: aiResponse,
      sentiment,
      resources
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return next(new ErrorResponse('Error processing your request', 500));
  }
});

// @desc      Analyze text sentiment
// @route     POST /api/chat/analyze
// @access    Private
exports.analyzeText = asyncHandler(async (req, res, next) => {
  const { text } = req.body;

  if (!text) {
    return next(new ErrorResponse('Please provide text to analyze', 400));
  }

  try {
    const sentiment = await analyzeSentiment(text);
    
    res.status(200).json({
      success: true,
      sentiment
    });
  } catch (error) {
    console.error('Sentiment Analysis Error:', error);
    return next(new ErrorResponse('Error analyzing text', 500));
  }
});

// Helper function to analyze sentiment using OpenAI
async function analyzeSentiment(text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that analyzes sentiment. Respond with a JSON object containing a "sentiment" field (positive, neutral, or negative) and a "score" field between -1 (very negative) and 1 (very positive).'
        },
        {
          role: 'user',
          content: `Analyze the sentiment of this text: "${text}"`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      sentiment: result.sentiment || 'neutral',
      score: parseFloat(result.score) || 0
    };
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    // Fallback to simple keyword-based sentiment analysis
    const positiveWords = ['happy', 'joy', 'excited', 'good', 'great', 'amazing', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'anxious', 'bad', 'terrible', 'awful', 'worst'];
    
    const textLower = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (textLower.includes(word)) score += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (textLower.includes(word)) score -= 0.2;
    });
    
    // Clamp score between -1 and 1
    score = Math.max(-1, Math.min(1, score));
    
    return {
      sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      score
    };
  }
}

// Helper function to get support resources based on sentiment
async function getSupportResources(sentiment) {
  const resources = [
    {
      type: 'crisis',
      title: 'Crisis Support',
      description: 'If you\'re in crisis, please reach out to a crisis hotline.',
      url: 'https://www.mentalhealth.gov/get-help/immediate-help',
      icon: 'emergency'
    },
    {
      type: 'breathing',
      title: 'Breathing Exercise',
      description: 'Try this 4-7-8 breathing exercise to help calm your mind.',
      url: 'https://www.healthline.com/health/4-7-8-breathing',
      icon: 'breath'
    }
  ];

  if (sentiment.sentiment === 'negative') {
    resources.push({
      type: 'meditation',
      title: 'Guided Meditation',
      description: 'A short guided meditation to help ease your mind.',
      url: 'https://www.headspace.com/meditation/meditation-for-beginners',
      icon: 'meditation'
    });
  }

  return resources;
}
