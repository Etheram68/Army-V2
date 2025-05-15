import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const compagnieId = event.context.params?.id
  if (!compagnieId) {
    throw createError({
      statusCode: 400,
      message: 'compagnieId manquant dans les paramètres',
    })
  }

  return prisma.section.findMany({
    where: { compagnieId },
    select: {
      id: true,
      name: true,
    },
  })
})
