import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/requireAuth'
import { requireRole } from '~/server/utils/requireRole'
import { z } from 'zod'


const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().transform((val) => new Date(val)),
  visibility: z.enum(['GROUPE', 'SECTION', 'COMPAGNIE']),
  groupId: z.string().optional(),
  sectionId: z.string().optional(),
  compagnieId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  await requireRole(event, ['CHEF_GROUPE', 'CHEF_SECTION', 'COMMANDANT_UNITE'])

  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Requête invalide' })
  }

  const { title, description, date, visibility, groupId, sectionId, compagnieId } = parsed.data

  // Contrôle des permissions en fonction du rôle
  const allowedRoles = {
    GROUPE: ['CHEF_GROUPE', 'ADJOINT_CHEF_GROUPE'],
    SECTION: ['CHEF_SECTION', 'ADJOINT_CHEF_SECTION'],
    COMPAGNIE: ['COMMANDANT_UNITE', 'ADJOINT_COMMANDANT_UNITE'],
  }

  if (!allowedRoles[visibility].includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Non autorisé à créer cette mission' })
  }

  // Contrôle de la portée demandée
  if (visibility === 'GROUPE' && !groupId) {
    throw createError({ statusCode: 400, message: 'groupId requis pour une mission de groupe' })
  }
  if (visibility === 'SECTION' && !sectionId) {
    throw createError({ statusCode: 400, message: 'sectionId requis pour une mission de section' })
  }
  if (visibility === 'COMPAGNIE' && !compagnieId) {
    throw createError({ statusCode: 400, message: 'compagnieId requis pour une mission de compagnie' })
  }

  const mission = await prisma.mission.create({
    data: {
      title,
      description,
      date,
      visibility,
      createdById: user.id,
      groupId: groupId ?? null,
      sectionId: sectionId ?? null,
      compagnieId: compagnieId ?? null,
    },
  })

  return { success: true, mission }
})
