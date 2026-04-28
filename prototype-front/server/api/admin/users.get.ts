import { connectDB } from '../../utils/db'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.isAdmin)
    throw createError({ statusCode: 403, message: 'Accès réservé aux administrateurs' })

  await connectDB()
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean()
  return { users }
})
