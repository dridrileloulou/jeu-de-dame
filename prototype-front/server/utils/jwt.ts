import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'change-me-in-production'

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { id: string; email: string } {
  return jwt.verify(token, SECRET) as { id: string; email: string }
}
