import { connectDB } from '../../utils/db'
import { SavedGame } from '../../models/savedGame'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const body = await readBody(event)
  const { id, whiteName, blackName, currentPlayer, whiteCaptured, blackCaptured, timerSeconds, whiteTime, blackTime, board, mode, level, isDemo } = body

  await connectDB()

  if (id) {
    const game = await SavedGame.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { whiteName, blackName, currentPlayer, whiteCaptured, blackCaptured, timerSeconds, whiteTime, blackTime, board, mode, level },
      { new: true }
    )
    if (!game) throw createError({ statusCode: 404, message: 'Partie introuvable' })
    return { id: game._id }
  }

  const demoSnapshot = isDemo ? { board, currentPlayer, whiteCaptured, blackCaptured, whiteTime, blackTime } : null
  const game = await SavedGame.create({ userId: session.user.id, whiteName, blackName, currentPlayer, whiteCaptured, blackCaptured, timerSeconds, whiteTime, blackTime, board, mode: mode || 'offline', level: level || '', isDemo: !!isDemo, demoSnapshot })
  return { id: game._id }
})
