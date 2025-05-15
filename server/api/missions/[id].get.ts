import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const missionId = event.context.params?.id

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

  let hasAccess = false

  switch (user.role) {
    case 'COMMANDANT_UNITE':
      hasAccess = mission.compagnieId === compagnieId || 
                 mission.section?.compagnieId === compagnieId || 
                 mission.group?.section?.compagnieId === compagnieId
      break
    case 'CHEF_SECTION':
      hasAccess = mission.sectionId === sectionId || 
                 mission.group?.sectionId === sectionId
      break
    case 'CHEF_GROUPE':
      hasAccess = mission.groupId === groupId
      break
    case 'RESERVISTE':
      hasAccess = mission.participations.some(p => p.userId === user.id)
      break
  }

  if (!hasAccess) {
    throw createError({ statusCode: 403, message: 'Accès non autorisé à cette mission' })
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