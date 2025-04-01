import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline', 'break'],
    default: 'offline'
  },
  skills: [{
    type: String,
    enum: ['general', 'technical', 'billing', 'sales', 'support']
  }],
  currentCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },
  performance: {
    totalCalls: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 },
    satisfactionScore: { type: Number, default: 0 },
    resolutionRate: { type: Number, default: 0 }
  },
  schedule: {
    type: Map,
    of: {
      start: String,
      end: String,
      type: String
    }
  },
  settings: {
    maxConcurrentCalls: { type: Number, default: 1 },
    preferredLanguage: { type: String, default: 'en' },
    autoAnswer: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for faster queries
agentSchema.index({ status: 1 });
agentSchema.index({ 'performance.totalCalls': -1 });

const Agent = mongoose.model('Agent', agentSchema);

export default Agent; 