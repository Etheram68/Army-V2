import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

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
      return []
  }

  const missions = await prisma.mission.findMany({
    where: missionWhere,
    orderBy: { startDate: 'asc' },
    include: {
      participations: {
        where: { userId: user.id },
        select: { status: true, userId: true }
      }
    }
  })

  return missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    startDate: mission.startDate,
    endDate: mission.endDate,
    location: mission.location,
    participations: mission.participations
  }))
})
