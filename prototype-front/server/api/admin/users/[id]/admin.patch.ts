import { connectDB } from '../../../../utils/db'
import { User } from '../../../../models/user'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.isAdmin)
    throw createError({ statusCode: 403, message: 'Accès réservé aux administrateurs' })

  const targetId = getRouterParam(event, 'id')
  const { isAdmin } = await readBody(event)

  if (typeof isAdmin !== 'boolean')
    throw createError({ statusCode: 400, message: 'Paramètre isAdmin manquant' })

  await connectDB()
  const target = await User.findById(targetId)
  if (!target)
    throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

  // Seul le compte "admin" peut révoquer des droits admin
  if (!isAdmin && session.user.name !== 'admin')
    throw createError({ statusCode: 403, message: 'Seul l\'administrateur principal peut révoquer les droits admin' })

  // On ne peut pas révoquer l'admin principal lui-même
  if (!isAdmin && target.name === 'admin')
    throw createError({ statusCode: 403, message: 'Impossible de révoquer l\'administrateur principal' })

  target.isAdmin = isAdmin
  await target.save()

  return { success: true, isAdmin }
})
