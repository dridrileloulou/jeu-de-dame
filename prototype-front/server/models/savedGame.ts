import mongoose from 'mongoose'

const savedGameSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  whiteName:     { type: String, default: 'Blanc' },
  blackName:     { type: String, default: 'Noir' },
  currentPlayer: { type: String, default: 'white' },
  whiteCaptured: { type: Number, default: 0 },
  blackCaptured: { type: Number, default: 0 },
  timerSeconds:  { type: Number, default: 0 },
  whiteTime:     { type: Number, default: 0 },
  blackTime:     { type: Number, default: 0 },
  board:         { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export const SavedGame = mongoose.models.SavedGame || mongoose.model('SavedGame', savedGameSchema)
