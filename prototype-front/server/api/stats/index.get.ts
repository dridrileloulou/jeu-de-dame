import { connectDB } from '../../utils/db'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  await connectDB()
  const user = await User.findById(session.user.id).select('stats')
  return user?.stats ?? { online: { played: 0, wins: 0, losses: 0 }, ia: { played: 0, wins: 0, losses: 0 } }
})
