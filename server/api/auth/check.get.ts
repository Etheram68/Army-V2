import { prisma } from '~/server/utils/prisma'
import { jwtVerify } from 'jose'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) return { user: null }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(useRuntimeConfig().auth.jwtSecret))
    const userId = payload.userId as string

    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!session) return { user: null }

    return {
      token,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      }
    }
  } catch (err) {
    return { user: null }
  }
})
