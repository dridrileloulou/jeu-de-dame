import { connectDB } from '../../utils/db'
import { SavedGame } from '../../models/savedGame'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Non authentifié' })
  if (!session.user.isAdmin) throw createError({ statusCode: 403, message: 'Réservé aux administrateurs' })

  const id = getRouterParam(event, 'id')
  const { isDemo } = await readBody(event)
  await connectDB()

  const game = await SavedGame.findOne({ _id: id, userId: session.user.id })
  if (!game) throw createError({ statusCode: 404, message: 'Partie introuvable' })

  if (isDemo) {
    game.isDemo = true
    game.demoSnapshot = {
      board: game.board,
      currentPlayer: game.currentPlayer,
      whiteCaptured: game.whiteCaptured,
      blackCaptured: game.blackCaptured,
      whiteTime: game.whiteTime,
      blackTime: game.blackTime,
    }
  } else {
    game.isDemo = false
    game.demoSnapshot = null
  }

  await game.save()
  return { id: game._id }
})
