import { connectDB } from '../../utils/db'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  await connectDB()
  const user = await User.findById(session.user.id).select('gameHistory')
  const history = (user?.gameHistory ?? []).slice().reverse()
  return history
})
