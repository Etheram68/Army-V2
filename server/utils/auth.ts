// server/utils/auth.ts
import { getHeader, H3Event } from 'h3'
import { jwtVerify } from 'jose'
import { prisma } from '~/server/utils/prisma'

// 🔐 Fonction principale centralisée
export async function getUserFromToken(token: string) {
  const jwtSecret = useRuntimeConfig().auth.jwtSecret
  let payload

  try {
    payload = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
  } catch {
    throw createError({ statusCode: 401, message: 'Token invalide ou expiré' })
  }

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

  let parsed
  try {
    parsed = JSON.parse(decodeURIComponent(raw))
  } catch {
    throw createError({ statusCode: 400, message: 'Cookie malformé' })
  }

  return getUserFromToken(parsed.token)
}

// ✅ Lecture via header "Authorization: Bearer <token>"
export async function getUserFromSession(event: H3Event) {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) return null

  return getUserFromToken(token)
}