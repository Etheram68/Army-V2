import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/requireAuth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  const user = await requireAuth(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  // Récupérer l'ID de la mission
  const missionId = event.context.params?.id
  if (!missionId) {
    throw createError({
      statusCode: 400,
      message: 'ID de mission manquant'
    })
  }

  // Vérifier que la mission existe
  const mission = await prisma.mission.findUnique({
    where: { id: missionId }
  })

  if (!mission) {
    throw createError({
      statusCode: 404,
      message: 'Mission non trouvée'
    })
  }

  // Récupérer le statut de participation
  const body = await readBody(event)
  const { status } = body

  if (!status || !['PRESENT', 'ABSENT', 'INDEFINI'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Statut de participation invalide'
    })
  }

  // Vérifier les permissions de l'utilisateur
  const canParticipate = await prisma.mission.findFirst({
    where: {
      id: missionId,
      OR: [
        { visibility: 'GROUPE', group: { members: { some: { id: user.id } } } },
        { visibility: 'SECTION', section: { groupes: { some: { members: { some: { id: user.id } } } } } },
        { visibility: 'COMPAGNIE', compagnie: { sections: { some: { groupes: { some: { members: { some: { id: user.id } } } } } } } }
      ]
    }
  })

  if (!canParticipate) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'avez pas la permission de participer à cette mission'
    })
  }

  // Mettre à jour ou créer la participation
  const participation = await prisma.participation.upsert({
    where: {
      userId_missionId: {
        userId: user.id,
        missionId
      }
    },
    update: {
      status
    },
    create: {
      userId: user.id,
      missionId,
      status
    }
  })

  return {
    success: true,
    participation
  }
}) 