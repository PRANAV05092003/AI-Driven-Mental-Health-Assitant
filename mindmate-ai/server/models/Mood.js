const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['happy', 'sad', 'anxious', 'angry', 'calm', 'excited', 'grateful', 'tired', 'neutral']
  },
  intensity: {
    type: Number,
    required: [true, 'Intensity is required'],
    min: 1,
    max: 10
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500
  },
  activities: [{
    type: String,
    enum: ['work', 'exercise', 'social', 'family', 'hobby', 'rest', 'other']
  }],
  sleepQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  weather: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isShared: {
    type: Boolean,
    default: false
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

// Indexes for faster querying
moodSchema.index({ user: 1, createdAt: -1 });
moodSchema.index({ mood: 1 });
moodSchema.index({ 'activities': 1 });

// Virtual for formatted date (YYYY-MM-DD)
moodSchema.virtual('date').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Virtual for time of day (morning, afternoon, evening, night)
moodSchema.virtual('timeOfDay').get(function() {
  const hour = this.createdAt.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
});

// Pre-save hook to add default values
moodSchema.pre('save', function(next) {
  // Set default note if not provided
  if (!this.note) {
    this.note = `Feeling ${this.mood} with intensity ${this.intensity}/10`;
  }
  
  // Add current date as a tag if no tags provided
  if (!this.tags || this.tags.length === 0) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[this.createdAt.getDay()];
    this.tags = [dayOfWeek, this.timeOfDay];
  }
  
  next();
});

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;
