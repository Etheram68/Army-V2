<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { userRegisterSchema, type UserRegisterInput } from '~/schemas/user';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { useToast } from '@/components/ui/toast/use-toast'


const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

interface Section {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
}

const sections = ref<Section[]>([])
const groups = ref<Group[]>([])


const { handleSubmit, errors, defineField, setFieldError } = useForm<UserRegisterInput>({
  validationSchema: toTypedSchema(userRegisterSchema),
})

const [name, nameAttrs] = defineField('name');
const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [role, roleAttrs] = defineField('role');
const [groupId, groupAttrs] = defineField('groupId');
const [sectionId, sectionAttrs] = defineField('sectionId');

const { data: sectionsData, error: sectionsError } = useFetch('/api/sections')

watchEffect(() => {
  if (sectionsData.value) {
    sections.value = sectionsData.value
  }

  if (sectionsError.value) {
    toast({
      title: 'Erreur de chargement',
      description: 'Impossible de charger les sections.',
      variant: 'destructive'
    })
  }
})

watch(sectionId, async (val) => {
  if (!val) {
    groups.value = []
    form.setFieldValue('groupId', '')
    return
  }

  try {
    groups.value = await $fetch(`/api/sections/${val}/groups`)
  } catch (error) {
    console.error('Erreur de chargement des groupes:', error)
    toast({
      title: 'Erreur de chargement',
      description: 'Impossible de charger les groupes.',
      variant: 'destructive'
    })
    groups.value = []
  }
})

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    await authStore.register(
      values.email,
      values.password,
      values.name,
      values.role,
      values.sectionId,
      values.groupId
    )
    toast({
      title: 'Succès',
      description: 'Inscription réussie !',
      variant: 'default'
    })
    router.push('/login')
  } catch (error: any) {
    console.error('Registration error:', error)

    // Exemple avec une erreur retournée par l'API en format { field: 'email', message: 'Cet email est déjà utilisé' }
    if (error?.data?.field && error?.data?.message) {
      setFieldError(error.data.field, error.data.message)
    } else {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription',
        variant: 'destructive'
      })
    }
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <ClientOnly>
    <Form>
      <form @submit.prevent="onSubmit" class="space-y-4">

        <!-- Email -->
        <FormField name="email" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                v-model="email"
                type="email"
                placeholder="exemple@email.com"
                />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Nom -->
        <FormField name="name" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                v-model="name"
                type="text"
                placeholder="Votre nom"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Mot de passe -->
        <FormField name="password" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                v-model="password"
                type="password"
                placeholder="••••••••"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Rôle -->
        <FormField name="role" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Rôle</FormLabel>
            <FormControl>
              <Select
                v-bind="componentField"
                v-model="role"
                class="bg-white text-black border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent class="bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <SelectGroup>
                    <SelectItem class="px-4 py-2 hover:bg-gray-100" value="RESERVISTE">Réserviste</SelectItem>
                    <SelectItem class="px-4 py-2 hover:bg-gray-100" value="CHEF_GROUPE">Chef de groupe</SelectItem>
                    <SelectItem class="px-4 py-2 hover:bg-gray-100" value="CHEF_SECTION">Chef de section</SelectItem>
                    <SelectItem class="px-4 py-2 hover:bg-gray-100" value="COMMANDANT_UNITE">Commandant d'unité</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Section -->
        <FormField name="sectionId" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Section</FormLabel>
            <FormControl>
              <Select
                class="bg-white text-black border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                v-bind="componentField"
                v-model="sectionId"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une section" />
                </SelectTrigger>
                <SelectContent class="bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <SelectGroup>
                    <SelectItem
                      v-for="section in sections"
                      :key="section.id"
                      :value="section.id"
                    >
                      {{ section.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Groupe -->
        <FormField name="groupId" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Groupe</FormLabel>
            <FormControl>
              <Select
                class="bg-white text-black border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                v-bind="componentField"
                v-model="groupId"
                :disabled="!sectionId || !groups.length"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un groupe" />
                </SelectTrigger>
                <SelectContent class="bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  <SelectGroup>
                    <SelectItem
                      v-for="group in groups"
                      :key="group.id"
                      :value="group.id"
                      class="px-4 py-2 hover:bg-gray-100"
                    >
                      {{ group.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Bouton submit -->
        <Button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Inscription en cours...' : 'S\'inscrire' }}
        </Button>
      </form>

      <!-- Debug -->
      <pre>{{ errors }}</pre>
    </Form>
  </ClientOnly>
</template>