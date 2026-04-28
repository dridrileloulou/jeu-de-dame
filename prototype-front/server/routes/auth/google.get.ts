import { connectDB } from '../../utils/db'
import { User } from '../../models/user'
import { signToken } from '../../utils/jwt'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    await connectDB()

    let user = await User.findOne({ googleId: googleUser.sub })
    if (!user) user = await User.findOne({ email: googleUser.email.toLowerCase() })

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.sub,
        picture: googleUser.picture
      })
    } else if (!user.googleId) {
      user.googleId = googleUser.sub
      user.picture = googleUser.picture
      await user.save()
    }

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

    return sendRedirect(event, '/', 302)
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/', 302)
  }
})
