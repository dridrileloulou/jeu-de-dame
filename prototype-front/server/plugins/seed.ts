import bcrypt from 'bcryptjs'
import { connectDB } from '../utils/db'
import { User } from '../models/user'

export default defineNitroPlugin(async () => {
  try {
    await connectDB()
    const existing = await User.findOne({ name: 'admin' })
    if (!existing) {
      const hashed = await bcrypt.hash('mdp', 12)
      await User.create({ name: 'admin', email: 'admin@local', password: hashed, isAdmin: true })
      console.log('[seed] Compte admin créé (login: admin / mdp)')
    }
  } catch (e) {
    console.error('[seed] Impossible de créer le compte admin :', e)
  }
})
