import { createRoom } from '../../utils/rooms'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, message: 'Connexion requise' })

  const { timer, customSeconds, creatorColor } = await readBody(event)

  const room = createRoom(session.user.id, session.user.name, {
    timer: timer || 'none',
    customSeconds: customSeconds ? Number(customSeconds) : undefined,
    creatorColor: creatorColor || 'random'
  })

  return { code: room.code }
})
