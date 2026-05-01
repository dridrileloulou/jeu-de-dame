import { connectDB } from '../../utils/db'
import { SavedGame } from '../../models/savedGame'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  await connectDB()
  const games = await SavedGame.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean()
  return games
})
