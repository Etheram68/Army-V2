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
    throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })
  }

  const compagnieId = userWithRelations.group?.section?.compagnie?.id
  const sectionId = userWithRelations.group?.section?.id
  const groupId = userWithRelations.group?.id

  // Définir les conditions d'accès à la mission selon le rôle
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
      // Ne permet de participer qu’aux missions où il est explicitement membre
      roleScope = {
        OR: [
          { visibility: 'GROUPE', group: { members: { some: { id: user.id } } } },
          { visibility: 'SECTION', section: { groupes: { some: { members: { some: { id: user.id } } } } } },
          { visibility: 'COMPAGNIE', compagnie: { sections: { some: { groupes: { some: { members: { some: { id: user.id } } } } } } } }
        ]
      }
      break
  }

  // Vérifier si la mission existe et si elle est dans le scope du rôle
  const authorizedMission = await prisma.mission.findFirst({
    where: {
      id: missionId,
      ...roleScope,
    }
  })

  if (!authorizedMission) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'avez pas la permission de participer à cette mission'
    })
  }

  const now = new Date()
  if (new Date(authorizedMission.startDate) <= now) {
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