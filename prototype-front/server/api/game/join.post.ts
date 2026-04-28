import { getRoom } from '../../utils/rooms'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Connexion requise' })

  const { code } = await readBody(event)
  const room = getRoom(code?.toUpperCase?.())

  if (!room) throw createError({ statusCode: 404, message: 'Partie introuvable. Vérifiez le code.' })
  if (room.status !== 'waiting') throw createError({ statusCode: 400, message: 'Cette partie a déjà commencé.' })
  if (room.creatorId === session.user.id) throw createError({ statusCode: 400, message: 'Vous avez créé cette partie.' })

  room.joinerId = session.user.id
  return { code: room.code }
})
