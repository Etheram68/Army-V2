import { prisma } from '~/server/utils/prisma'

async function seedStructure() {
  const compagnieName = '6 Compagnie'
  const sections = [
    {
      name: 'Section 1',
      groupes: ['Golf 1', 'Golf 2', 'Golf 3'],
    },
  ]

  try {
    console.log(`📦 Création de la compagnie "${compagnieName}"`)
    const compagnie = await prisma.compagnie.create({
      data: {
        name: compagnieName,
      },
    })

    for (const sectionData of sections) {
      console.log(`├─ 📁 Section "${sectionData.name}"`)
      const section = await prisma.section.create({
        data: {
          name: sectionData.name,
          compagnieId: compagnie.id,
        },
      })

      for (const groupName of sectionData.groupes) {
        console.log(`│  ├─ 👥 Groupe "${groupName}"`)
        await prisma.group.create({
          data: {
            name: groupName,
            sectionId: section.id,
          },
        })
      }
    }

    console.log('✅ Structure créée avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion :', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedStructure()
