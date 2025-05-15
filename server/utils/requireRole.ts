import { H3Event } from 'h3'
import { getUserFromCookie } from '~/server/utils/auth'

export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const user = await getUserFromCookie(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  if (!allowedRoles.includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Accès non autorisé' })
  }

  return user
}
export default requireRole