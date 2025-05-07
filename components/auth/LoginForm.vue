<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const { toast } = useToast()

const handleSubmit = async () => {
  try {
    isLoading.value = true
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Une erreur est survenue',
      variant: 'destructive'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Connexion</CardTitle>
      <CardDescription>Connectez-vous à votre compte</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label for="email">Email</label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
          />
        </div>
        <div class="space-y-2">
          <label for="password">Mot de passe</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="flex justify-center">
      <NuxtLink to="/register" class="text-sm text-primary hover:underline">
        Créer un compte
      </NuxtLink>
    </CardFooter>
  </Card>
</template> 