// server/api/compagnies/index.get.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  return prisma.compagnie.findMany({
    select: { id: true, name: true }
  })
})
