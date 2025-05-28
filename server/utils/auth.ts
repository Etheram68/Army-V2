// server/utils/auth.ts
import { getHeader, H3Event, getCookie, setCookie, createError } from 'h3'
import { jwtVerify, SignJWT, JWTPayload } from 'jose'
import { prisma } from '~/server/utils/prisma'

interface JwtPayload extends JWTPayload {
  userId: string
}

export async function generateJwtToken(payload: JwtPayload) {
  const jwtSecret = useRuntimeConfig().auth.jwtSecret
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Token court, renouvelable
    .sign(new TextEncoder().encode(jwtSecret))
}

// 🔐 Fonction principale centralisée
export async function getUserFromToken(token: string, event: H3Event) {
  const jwtSecret = useRuntimeConfig().auth.jwtSecret
  let payload: JwtPayload

  try {
    // ✅ Si JWT valide, on continue normalement
    const verified = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    payload = verified.payload as JwtPayload
  } catch (err: any) {
    // ❌ Si expiré, on tente de récupérer la session
    if (err.code === 'ERR_JWT_EXPIRED') {
      const session = await prisma.session.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      })

      if (!session?.user) {
        throw createError({ statusCode: 401, message: 'Session expirée' })
      }

      // 🔁 Session encore valide => on régénère un nouveau JWT
      const newToken = await generateJwtToken({ userId: session.user.id })

      setCookie(event, 'auth', JSON.stringify({ token: newToken }), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15 // 15 minutes
      })

      return session.user
    }

    // 🛑 Autre erreur => invalide
    throw createError({ statusCode: 401, message: 'Token invalide ou expiré' })
  }

  // ✅ Si JWT valide et décodé, on vérifie la session associée
  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  })

  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Utilisateur introuvable' })
  }

  return session.user
}

// ✅ Lecture via cookie "auth"
export async function getUserFromCookie(event: H3Event) {
  const raw = getCookie(event, 'auth')
  if (!raw) throw createError({ statusCode: 401, message: 'Cookie manquant' })

  let parsed: { token: string }

  try {
    parsed = JSON.parse(decodeURIComponent(raw))
  } catch {
    throw createError({ statusCode: 400, message: 'Cookie malformé' })
  }

  return getUserFromToken(parsed.token, event)
}

// ✅ Lecture via header "Authorization: Bearer <token>"
export async function getUserFromSession(event: H3Event) {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) return null

  return getUserFromToken(token, event)
}
