import { connectDB } from '../../utils/db'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const { mode, result, opponent, reason } = await readBody(event)
  if (!['online', 'ia', 'local'].includes(mode)) throw createError({ statusCode: 400, message: 'Mode invalide' })

  await connectDB()

  const update: Record<string, any> = {
    $push: { gameHistory: { $each: [{ mode, result, opponent: opponent ?? null, reason: reason ?? null, date: new Date() }], $slice: -50 } }
  }

  if (mode !== 'local') {
    if (!['win', 'loss'].includes(result)) throw createError({ statusCode: 400, message: 'Résultat invalide' })
    update.$inc = {
      [`stats.${mode}.played`]: 1,
      [`stats.${mode}.${result === 'win' ? 'wins' : 'losses'}`]: 1
    }
  }

  await User.findByIdAndUpdate(session.user.id, update)
  return { ok: true }
})
