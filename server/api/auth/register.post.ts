import { prisma } from '~/server/utils/prisma'
import { hash } from 'argon2'
import { SignJWT } from 'jose'
import { userRegisterSchema } from '~/schemas/user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parse = userRegisterSchema.safeParse(body);
  if (!parse.success) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: 'Validation error',
      data: parse.error.flatten().fieldErrors, // Renvoie les erreurs structurées
    }));
  }
  
  const { name, email, password, role, sectionId, groupId } = parse.data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'Un utilisateur avec cet email existe déjà'
    })
  }

  const hashedPassword = await hash(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role,
      groupId
    }
  })

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(useRuntimeConfig().auth.jwtSecret))

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
})
