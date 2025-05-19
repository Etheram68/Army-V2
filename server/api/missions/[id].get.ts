import { prisma } from '~/server/utils/prisma'
import { getRouterParam } from 'h3'
import { requireAuth } from '~/server/utils/requireAuth'
import { hasAccessToMission } from '~/server/utils/missionAccess'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const missionId = getRouterParam(event, 'id')

  if (!missionId) {
    throw createError({ statusCode: 400, message: 'ID de mission manquant' })
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      compagnie: true,
      section: true,
      group: {
        include: {
          section: {
            include: {
              compagnie: true
            }
          }
        }
      },
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  })

  if (!mission) {
    throw createError({ statusCode: 404, message: 'Mission non trouvée' })
  }

  // Vérification des permissions
  const hasAccess = await hasAccessToMission(user.id, missionId)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'avez pas la permission de participer à cette mission'
    })
  }

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    startDate: mission.startDate,
    endDate: mission.endDate,
    visibility: mission.visibility,
    compagnie: mission.compagnie,
    section: mission.section,
    group: mission.group,
    createdBy: mission.createdBy,
    participations: mission.participations.map(p => ({
      id: p.id,
      user: p.user,
      status: p.status,
      joinedAt: p.updatedAt
    }))
  }
})