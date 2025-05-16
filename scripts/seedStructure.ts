import { faker } from '@faker-js/faker'
import { prisma } from '~/server/utils/prisma'
import { MissionVisibility, ParticipationStatus, Role } from '@prisma/client'

async function seedStructure() {
  const compagnieName = '6 Compagnie'
  const sectionCount = 3
  const groupPerSection = 4
  const usersPerGroup = 6
  const missionCount = 15

  try {
    console.log(`📦 Création de la compagnie "${compagnieName}"`)
    const compagnie = await prisma.compagnie.create({
      data: {
        name: compagnieName,
      },
    })

    const allUsers: string[] = []
    const allGroups = []
    const allSections = []

    for (let s = 1; s <= sectionCount; s++) {
      const sectionName = `Section ${s}`
      console.log(`├─ 📁 Section "${sectionName}"`)

      const section = await prisma.section.create({
        data: {
          name: sectionName,
          compagnieId: compagnie.id,
        },
      })
      allSections.push(section)

      for (let g = 1; g <= groupPerSection; g++) {
        const groupName = `Groupe ${s}-${g}`
        console.log(`│  ├─ 👥 Groupe "${groupName}"`)

        const group = await prisma.group.create({
          data: {
            name: groupName,
            sectionId: section.id,
          },
        })
        allGroups.push(group)

        for (let u = 1; u <= usersPerGroup; u++) {
          const user = await prisma.user.create({
            data: {
              name: faker.person.fullName(),
              email: faker.internet.email().toLowerCase(),
              password: 'hashedpassword',
              groupId: group.id,
              role: Role.RESERVISTE,
            },
          })
          allUsers.push(user.id)
        }
      }
    }

    const chef = await prisma.user.create({
      data: {
        name: 'Chef Unité',
        email: 'chef@militaire.fr',
        password: 'hashedpassword',
        role: Role.COMMANDANT_UNITE,
      },
    })

    for (let i = 1; i <= missionCount; i++) {
      const visibility = faker.helpers.arrayElement([
        MissionVisibility.GROUPE,
        MissionVisibility.SECTION,
        MissionVisibility.COMPAGNIE,
      ])

      let missionData: any = {
        title: faker.lorem.words(4),
        description: faker.lorem.paragraph(),
        startDate: faker.date.soon(),
        endDate: faker.date.soon({ days: 10 }),
        visibility,
        createdById: chef.id,
      }

      if (visibility === 'GROUPE') {
        const group = faker.helpers.arrayElement(allGroups)
        missionData.groupId = group.id
      } else if (visibility === 'SECTION') {
        const section = faker.helpers.arrayElement(allSections)
        missionData.sectionId = section.id
      } else if (visibility === 'COMPAGNIE') {
        missionData.compagnieId = compagnie.id
      }

      const mission = await prisma.mission.create({ data: missionData })

      const participants = faker.helpers.arrayElements(allUsers, 10)
      for (const userId of participants) {
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
    }

    console.log('✅ Données de test insérées avec succès !')
  } catch (error) {
    console.error('❌ Erreur :', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedStructure()
