import { prisma } from '~/server/utils/prisma'
import { getQuery } from 'h3'
import { requireAuth } from '~/server/utils/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const take = 10
  const skip = (page - 1) * take

  const userWithRelations = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      group: {
        include: {
          section: {
            include: {
              compagnie: true
            }
          }
        }
      }
    }
  })

  if (!userWithRelations) {
    throw createError({ statusCode: 404, message: 'Utilisateur non trouvé' })
  }

  const compagnieId = userWithRelations.group?.section?.compagnie?.id
  const sectionId = userWithRelations.group?.section?.id
  const groupId = userWithRelations.group?.id

  let roleScope: any = {}

  switch (user.role) {
    case 'COMMANDANT_UNITE':
      roleScope = {
        OR: [
          { compagnieId },
          { section: { compagnieId } },
          { group: { section: { compagnieId } } },
        ],
      }
      break

    case 'CHEF_SECTION':
      roleScope = {
        OR: [
          { sectionId },
          { group: { sectionId } },
        ],
      }
      break

    case 'CHEF_GROUPE':
      roleScope = {
        groupId,
      }
      break

    case 'RESERVISTE':
    default:
      return { missions: [], total: 0 }
  }

  const where = {
    AND: [
      roleScope,
      {
        startDate: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Date actuelle moins 24h
        }
      }
    ],
  }

  const [missions, total] = await Promise.all([
    prisma.mission.findMany({
      where,
      skip,
      take,
      orderBy: { startDate: 'asc' },
      include: {
        compagnie: { select: { name: true } },
        section: { select: { name: true } },
        group: { select: { name: true } },
        _count: {
          select: {
            participations: true
          }
        },
        participations: {
          where: {
            userId: user.id
          },
          select: {
            id: true
          }
        }
      },
    }),
    prisma.mission.count({ where }),
  ])

  return {
    missions: missions.map(mission => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      startDate: mission.startDate,
      endDate: mission.endDate,
      participantsCount: mission._count.participations,
      hasParticipated: mission.participations.length > 0
    })),
    total
  }
})
