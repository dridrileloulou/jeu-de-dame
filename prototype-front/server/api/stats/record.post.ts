import { connectDB } from '../../utils/db'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const { mode, result, opponent, reason } = await readBody(event)
  if (!['online', 'ia'].includes(mode)) throw createError({ statusCode: 400, message: 'Mode invalide' })
  if (!['win', 'loss'].includes(result)) throw createError({ statusCode: 400, message: 'Résultat invalide' })

  await connectDB()

  const inc: Record<string, number> = {
    [`stats.${mode}.played`]: 1,
    [`stats.${mode}.${result === 'win' ? 'wins' : 'losses'}`]: 1
  }

  const entry = { mode, result, opponent: opponent ?? null, reason: reason ?? null, date: new Date() }

  const user = await User.findByIdAndUpdate(
    session.user.id,
    {
      $inc: inc,
      $push: { gameHistory: { $each: [entry], $slice: -50 } }
    },
    { new: true }
  )
  return { ok: true }
})
