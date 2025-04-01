import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['incoming', 'answered', 'completed', 'failed'],
    default: 'incoming'
  },
  duration: {
    type: Number,
    default: 0
  },
  recordingUrl: {
    type: String
  },
  transcription: {
    type: String
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative']
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  aiResponse: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
callSchema.index({ phoneNumber: 1, createdAt: -1 });
callSchema.index({ status: 1 });
callSchema.index({ agent: 1 });

const Call = mongoose.model('Call', callSchema);

export default Call; 