const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Journal content is required'],
    trim: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'angry', 'calm', 'excited', 'grateful', 'tired', 'neutral'],
    default: 'neutral'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Mood rating is required']
  },
  activities: [{
    type: String,
    enum: ['exercise', 'meditation', 'social', 'work', 'hobby', 'rest', 'other']
  }],
  location: {
    type: String,
    trim: true
  },
  weather: {
    type: String,
    trim: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  aiInsights: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster querying
journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ emotion: 1 });
journalSchema.index({ tags: 1 });

// Pre-save hook to analyze sentiment if not provided
journalSchema.pre('save', async function(next) {
  if (this.isModified('content') && !this.sentimentScore) {
    // Simple sentiment analysis (can be replaced with more sophisticated analysis)
    const positiveWords = ['happy', 'joy', 'excited', 'good', 'great', 'amazing', 'wonderful'];
    const negativeWords = ['sad', 'angry', 'anxious', 'bad', 'terrible', 'awful', 'worst'];
    
    const content = this.content.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (content.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) score -= 1;
    });
    
    // Normalize score between -1 and 1
    this.sentimentScore = Math.max(-1, Math.min(1, score / 5));
  }
  next();
});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;
