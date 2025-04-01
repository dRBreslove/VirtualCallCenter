import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.socialProvider;
    }
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent', 'viewer'],
    default: 'viewer'
  },
  picture: {
    type: String
  },
  socialProvider: {
    type: String,
    enum: ['google', 'microsoft', 'github', 'apple', 'samsung', 'linkedin', 'twitter', 'facebook', 'instagram', 'pinterest', 'reddit', 'whatsapp', 'telegram', 'discord', 'twitch', null],
    default: null
  },
  socialId: {
    type: String,
    sparse: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User; 