import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { User } from '../../models/user'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { email, password } = await readBody(event)

  if (!email || !password)
    throw createError({ statusCode: 400, message: 'Identifiant et mot de passe requis' })

  // Recherche par email OU par nom (permet de se connecter avec "admin")
  let user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user) user = await User.findOne({ name: email }).select('+password')

  if (!user || !user.password)
    throw createError({ statusCode: 401, message: 'Identifiants incorrects' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid)
    throw createError({ statusCode: 401, message: 'Identifiants incorrects' })

  const token = signToken({ id: user._id.toString(), email: user.email })

  await setUserSession(event, {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      picture: user.picture ?? null,
      elo: user.elo,
      isAdmin: user.isAdmin ?? false
    },
    token
  })

  return { success: true }
})
