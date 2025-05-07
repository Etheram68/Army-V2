import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const sectionId = event.context.params?.id
  if (!sectionId) throw createError({ statusCode: 400, message: 'ID manquant' })

  return prisma.group.findMany({
    where: { sectionId },
    select: { id: true, name: true },
  })
})
