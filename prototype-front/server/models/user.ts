import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  googleId: { type: String },
  picture:  { type: String },
  elo:      { type: Number, default: 1000 },
  isAdmin:  { type: Boolean, default: false }
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
