import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  googleId: { type: String },
  picture:  { type: String },
  elo:      { type: Number, default: 1000 },
  isAdmin:  { type: Boolean, default: false },
  stats: {
    online: {
      played: { type: Number, default: 0 },
      wins:   { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    },
    ia: {
      played: { type: Number, default: 0 },
      wins:   { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    }
  },
  gameHistory: [{
    mode:     { type: String },
    result:   { type: String },
    opponent: { type: String },
    reason:   { type: String },
    date:     { type: Date, default: Date.now }
  }]
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
