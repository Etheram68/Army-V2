import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/requireAuth'
import { hasAccessToMission } from '~/server/utils/missionAccess'

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

  // Récupérer le statut de participation
  const body = await readBody(event)
  const { status } = body

  if (!status || !['PRESENT', 'ABSENT', 'INDEFINI'].includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Statut de participation invalide'
    })
  }

  // Charger l'utilisateur avec ses relations hiérarchiques
  const hasAccess = await hasAccessToMission(user.id, missionId)
  if (!hasAccess) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'avez pas la permission de participer à cette mission'
    })
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { startDate: true }
  })
  if (!mission || new Date(mission?.startDate) <= new Date()) {
    throw createError({
      statusCode: 403,
      message: 'Impossible de participer à une mission déjà commencée.'
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