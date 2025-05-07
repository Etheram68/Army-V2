import { prisma } from '~/server/utils/prisma'
import { verify } from 'argon2'
import { SignJWT } from 'jose'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email et mot de passe requis' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Utilisateur non trouvé' })
  }

  const isValid = await verify(user.password, password)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Mot de passe incorrect' })
  }

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(useRuntimeConfig().auth.jwtSecret))

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})
