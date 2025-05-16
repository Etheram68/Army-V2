import { prisma } from '~/server/utils/prisma'

export async function hasAccessToMission(userId: string, missionId: string): Promise<boolean> {
  const [user, mission] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
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
    }),
    prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        participations: { select: { userId: true } },
        section: true,
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
  ])

  if (!user || !mission) return false

  const compagnieId = user.group?.section?.compagnie?.id
  const sectionId = user.group?.section?.id
  const groupId = user.group?.id

  const { visibility } = mission

  let access = false

  switch (user.role) {
    case 'COMMANDANT_UNITE':
      if (visibility === 'COMPAGNIE' && mission.compagnieId === compagnieId) access = true
      if (visibility === 'SECTION' && mission.section?.compagnieId === compagnieId) access = true
      if (visibility === 'GROUPE' && mission.group?.section?.compagnieId === compagnieId) access = true
      break

    case 'CHEF_SECTION':
      if (visibility === 'COMPAGNIE' && mission.compagnieId === compagnieId) access = true
      if (visibility === 'SECTION' && mission.section?.id === sectionId) access = true
      if (visibility === 'GROUPE' && mission.group?.sectionId === sectionId) access = true
      break

    case 'CHEF_GROUPE':
    case 'RESERVISTE':
      if (visibility === 'COMPAGNIE' && mission.compagnieId === compagnieId) access = true
      if (visibility === 'SECTION' && mission.section?.id === sectionId) access = true
      if (visibility === 'GROUPE' && mission.group?.id === groupId) access = true
      break
  }

  const isParticipant = mission.participations.some(p => p.userId === userId)

  return access || isParticipant
}
