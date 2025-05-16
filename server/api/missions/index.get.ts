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

  let missionWhere: any = {
    startDate: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  }

  switch (user.role) {
    case 'COMMANDANT_UNITE':
      missionWhere.OR = [
        { visibility: 'COMPAGNIE', compagnieId },
        { visibility: 'SECTION', section: { is: { compagnieId } } },
        { visibility: 'GROUPE', group: { is: { section: { is: { compagnieId } } } } }
      ]
      break
  
    case 'CHEF_SECTION':
      missionWhere.OR = [
        { visibility: 'COMPAGNIE', compagnieId },
        { visibility: 'SECTION', sectionId },
        { visibility: 'GROUPE', group: { is: { sectionId } } }
      ]
      break
  
    case 'CHEF_GROUPE':
    case 'RESERVISTE':
      missionWhere.OR = [
        { visibility: 'COMPAGNIE', compagnieId },
        { visibility: 'SECTION', sectionId },
        { visibility: 'GROUPE', groupId }
      ]
      break
  
    default:
      return { missions: [], total: 0 } // Rôle inconnu
  }

  const [missions, total] = await Promise.all([
    prisma.mission.findMany({
      where: missionWhere,
      skip,
      take,
      orderBy: { startDate: 'asc' },
      include: {
        compagnie: { select: { name: true } },
        section: { select: { name: true } },
        group: { select: { name: true } },
        participations: {
          select: {
            id: true,
            status: true,
            userId: true
          }
        }
      }
    }),
    prisma.mission.count({ where: missionWhere })
  ])

  return {
    missions: missions.map(mission => {
      const participantsPresent = mission.participations.filter(p => p.status === 'PRESENT').length
      const hasParticipated = mission.participations.some(p => p.userId === user.id)

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        startDate: mission.startDate,
        endDate: mission.endDate,
        participantsCount: participantsPresent,
        hasParticipated
      }
    }),
    total
  }
})
