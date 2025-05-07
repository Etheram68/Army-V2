import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  return prisma.section.findMany({ select: { id: true, name: true } })
})
