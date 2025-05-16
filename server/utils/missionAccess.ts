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
          select: { userId: true }
        }
      }
    })
  ])

  if (!user || !mission) return false

  const compagnieId = user.group?.section?.compagnie?.id
  const sectionId = user.group?.section?.id
  const groupId = user.group?.id

  const missionCompagnieId =
    mission.compagnieId ||
    mission.section?.compagnieId ||
    mission.group?.section?.compagnieId

  const missionSectionId =
    mission.sectionId ||
    mission.group?.sectionId
    
  const missionGroupId = mission.groupId

  const isInHierarchy = [
    missionCompagnieId === compagnieId,
    missionSectionId === sectionId,
    missionGroupId === groupId
  ].some(Boolean)

  const isParticipant = mission.participations.some(p => p.userId === userId)

  return isInHierarchy || isParticipant
}
