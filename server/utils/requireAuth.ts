import { getUserFromSession } from '~/server/utils/auth'
import { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }
  return user
}
