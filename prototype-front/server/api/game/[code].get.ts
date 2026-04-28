import { getRoom } from '../../utils/rooms'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Code manquant' })

  const room = getRoom(code)
  if (!room) throw createError({ statusCode: 404, message: 'Partie introuvable' })

  return { code: room.code, status: room.status, params: room.params }
})
