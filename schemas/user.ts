import { z } from 'zod';


export const userRegisterSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    name: z.string().nonempty('Le nom est requis'),
    role: z.enum([
      'RESERVISTE',
      'CHEF_GROUPE',
      'CHEF_SECTION',
      'COMMANDANT_UNITE',
    ], {
      required_error: 'Rôle requis'
    }),
    sectionId: z.string({
      required_error: 'Section requise'
    }).nonempty('Section requise'),
    groupId: z.string({
      required_error: 'Groupe requis'
    }).nonempty('Groupe requis')
  })

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;