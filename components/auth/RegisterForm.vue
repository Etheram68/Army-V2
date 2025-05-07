<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
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

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string(),
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
  }),
  groupId: z.string({
    required_error: 'Groupe requis'
  })
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: '',
    password: '',
    name: '',
    role: 'RESERVISTE',
    sectionId: '',
    groupId: ''
  }
})

const { data: sectionsData, error: sectionsError } = useFetch('/api/sections')

onMounted(() => {
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

const sectionId = computed(() => form.values.sectionId)

const { data: groupsData, error: groupsError } = useAsyncData<Group[]>(
  'groups',
  async () => {
    if (!sectionId.value) return []
    return await $fetch(`/api/sections/${sectionId.value}/groups`)
  },
  {
    watch: [sectionId],
    immediate: false
  }
)

watch(groupsData, (newGroups) => {
  if (newGroups) {
    groups.value = newGroups
  }
})

watch(groupsError, (error) => {
  if (error) {
    toast({
      title: 'Erreur de chargement',
      description: 'Impossible de charger les groupes.',
      variant: 'destructive'
    })
    groups.value = []
  }
})

const isSubmitting = ref(false)

const onSubmit = form.handleSubmit(async (values) => {
  console.log('[onSubmit] Form values:', values)
  try {
    isSubmitting.value = true
    console.log('Submitting form with values:', values)
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
  } catch (error) {
    console.error('Registration error:', error)
    toast({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription',
      variant: 'destructive'
    })
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <ClientOnly>
    <Form :form="form">
      <form @submit.prevent="onSubmit" class="space-y-4">

        <!-- Email -->
        <FormField name="email" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                @update:modelValue="(val) => form.setFieldValue('email', val)"
                type="email"
                placeholder="exemple@email.com"
                />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Nom -->
        <FormField name="name" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input
                @update:modelValue="(val) => form.setFieldValue('name', val)"
                type="text"
                placeholder="Votre nom"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Mot de passe -->
        <FormField name="password" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input
                @update:modelValue="(val) => form.setFieldValue('password', val)"
                type="password"
                placeholder="••••••••"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Rôle -->
        <FormField name="role" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Rôle</FormLabel>
            <FormControl>
              <Select
                :modelValue="form.values.role"
                @update:modelValue="(val) => form.setFieldValue('role', val)"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="RESERVISTE">Réserviste</SelectItem>
                    <SelectItem value="CHEF_GROUPE">Chef de groupe</SelectItem>
                    <SelectItem value="CHEF_SECTION">Chef de section</SelectItem>
                    <SelectItem value="COMMANDANT_UNITE">Commandant d'unité</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Section -->
        <FormField name="sectionId" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Section</FormLabel>
            <FormControl>
              <Select
                :modelValue="value"
                @update:modelValue="(val) => {
                  form.setFieldValue('sectionId', val)
                  form.setFieldValue('groupId', '') // reset group on section change
                }"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une section" />
                </SelectTrigger>
                <SelectContent>
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
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Groupe -->
        <FormField name="groupId" v-slot="{ value, errorMessage }">
          <FormItem>
            <FormLabel>Groupe</FormLabel>
            <FormControl>
              <Select 
                :disabled="!form.values.sectionId"
                :modelValue="value"
                @update:modelValue="(val) => form.setFieldValue('groupId', val)"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="group in groups"
                      :key="group.id"
                      :value="group.id"
                    >
                      {{ group.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
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
      <pre>{{ form.errors }}</pre>
    </Form>
  </ClientOnly>
</template>