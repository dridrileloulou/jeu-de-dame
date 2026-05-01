import { connectDB } from '../../utils/db'
import { SavedGame } from '../../models/savedGame'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const id = getRouterParam(event, 'id')
  await connectDB()
  await SavedGame.deleteOne({ _id: id, userId: session.user.id })
  return { ok: true }
})
