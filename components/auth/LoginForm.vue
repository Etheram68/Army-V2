<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { userConnectionSchema, type UserConnectionInput } from '~/schemas/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from '@/components/ui/form'
import { useToast } from '@/components/ui/toast/use-toast'


const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

const isSubmitting = ref(false)

const { handleSubmit, errors, defineField, setFieldError } = useForm<UserConnectionInput>({
  validationSchema: toTypedSchema(userConnectionSchema)
})

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit =  handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    await authStore.login(values.email, values.password)
    toast({
      title: 'Connexion réussie',
      description: 'Vous êtes connecté avec succès',
      variant: 'default'
    })
    router.push('/')
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Une erreur est survenue',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle>Connexion</CardTitle>
      <CardDescription>Connectez-vous à votre compte</CardDescription>
    </CardHeader>
    <CardContent>
      <Form>
        <form @submit.prevent="onSubmit" class="space-y-4">

          <!-- Email -->
          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  v-bind="componentField"
                  v-model="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Password -->
          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel for="password">Mot de passe</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  v-bind="componentField"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </FormControl>
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
          </Button>
        </form>
      </Form>
    </CardContent>
    <CardFooter class="flex justify-center">
      <NuxtLink to="/register" class="text-sm text-primary hover:underline">
        Créer un compte
      </NuxtLink>
    </CardFooter>
  </Card>
</template> 