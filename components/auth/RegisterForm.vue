<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const authStore = useAuthStore()
const router = useRouter()

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().optional()
}))

const { handleSubmit, errors } = useForm({ validationSchema: formSchema })

const { value: email } = useField<string>('email')
const { value: name } = useField<string>('name')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.register(values.email, values.password, values.name)
    router.push('/login')
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Une erreur est survenue',
      variant: 'destructive'
    })
    console.error('Erreur lors de l\'inscription:', error)
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="exemple@email.com"
      />
      <p v-if="errors.email" class="text-sm text-red-500">
        {{ errors.email }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="name">Nom (optionnel)</Label>
      <Input
        id="name"
        v-model="name"
        type="text"
        placeholder="Votre nom"
      />
      <p v-if="errors.name" class="text-sm text-red-500">
        {{ errors.name }}
      </p>
    </div>

    <div class="space-y-2">
      <Label for="password">Mot de passe</Label>
      <Input
        id="password"
        v-model="password"
        type="password"
        placeholder="••••••••"
      />
      <p v-if="errors.password" class="text-sm text-red-500">
        {{ errors.password }}
      </p>
    </div>

    <Button type="submit" class="w-full">
      S'inscrire
    </Button>
  </form>
</template> 