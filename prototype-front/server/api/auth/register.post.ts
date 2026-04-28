import bcrypt from 'bcryptjs'
import { connectDB } from '../../utils/db'
import { User } from '../../models/user'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { name, email, password } = await readBody(event)

  if (!name || !email || !password)
    throw createError({ statusCode: 400, message: 'Nom, email et mot de passe requis' })
  if (password.length < 6)
    throw createError({ statusCode: 400, message: 'Mot de passe trop court (6 caractères min.)' })

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing)
    throw createError({ statusCode: 409, message: 'Cet email est déjà utilisé' })

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed })

  const token = signToken({ id: user._id.toString(), email: user.email })

  await setUserSession(event, {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      picture: user.picture ?? null,
      elo: user.elo,
      isAdmin: false
    },
    token
  })

  return { success: true }
})
