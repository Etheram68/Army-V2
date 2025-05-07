import { getHeader, H3Event } from 'h3'
import { jwtVerify } from 'jose'
import { prisma } from '~/server/utils/prisma'

export async function getUserFromSession(event: H3Event) {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(useRuntimeConfig().auth.jwtSecret))
    const session = await prisma.session.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    return session?.user ?? null
  } catch {
    return null
  }
}
