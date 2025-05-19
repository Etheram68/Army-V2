import { faker } from '@faker-js/faker'
import { prisma } from '~/server/utils/prisma'
import { MissionVisibility, ParticipationStatus, Role } from '@prisma/client'

const MISSION_COUNT = 20

async function seedMissions() {
  try {
    console.log('🚀 Création de missions supplémentaires...')

    const compagnie = await prisma.compagnie.findFirst()
    const sections = await prisma.section.findMany()
    const groups = await prisma.group.findMany()
    const users = await prisma.user.findMany({ where: { role: Role.RESERVISTE } })

    const chef = await prisma.user.findFirst({ where: { role: Role.COMMANDANT_UNITE } })
    if (!chef) throw new Error("Aucun utilisateur avec le rôle 'COMMANDANT_UNITE' trouvé.")

    for (let i = 0; i < MISSION_COUNT; i++) {
      const visibility = faker.helpers.arrayElement([
        MissionVisibility.COMPAGNIE,
        MissionVisibility.SECTION,
        MissionVisibility.GROUPE,
      ])

      const start = faker.date.soon({ days: 30 })
      const end = faker.date.soon({ days: 10, refDate: start })

      const missionData: any = {
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        startDate: start,
        endDate: end,
        visibility,
        createdById: chef.id,
      }

      if (visibility === 'GROUPE') {
        missionData.groupId = faker.helpers.arrayElement(groups).id
      } else if (visibility === 'SECTION') {
        missionData.sectionId = faker.helpers.arrayElement(sections).id
      } else if (visibility === 'COMPAGNIE') {
        missionData.compagnieId = compagnie?.id
      }

      const mission = await prisma.mission.create({ data: missionData })

      // Ajouter des participations aléatoires
      const selectedUsers = faker.helpers.arrayElements(users.map(u => u.id), 10)
      for (const userId of selectedUsers) {
        await prisma.participation.create({
          data: {
            userId,
            missionId: mission.id,
            status: faker.helpers.arrayElement([
              ParticipationStatus.PRESENT,
              ParticipationStatus.ABSENT,
              ParticipationStatus.INDEFINI,
            ]),
          },
        })
      }

      console.log(`✅ Mission "${mission.title}" créée avec ${selectedUsers.length} participants.`)
    }

    console.log('🎉 Missions générées avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de la création des missions :', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedMissions()
