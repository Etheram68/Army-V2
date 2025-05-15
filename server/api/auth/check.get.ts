import { getUserFromCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromCookie(event)

  if (!user) {
    return { user: null }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})