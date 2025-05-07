<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Label } from '@/components/ui/label'
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

const sections = ref([])
const groups = ref([])

const formSchema = toTypedSchema(z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string(),
  role: z.enum([
    'RESERVISTE',
    'CHEF_GROUPE',
    'CHEF_SECTION',
    'COMMANDANT_UNITE',
  ]),
  sectionId: z.string(),
  groupId: z.string()
}))

const form = useForm({
  validationSchema: formSchema
})

onMounted(async () => {
  sections.value = await $fetch('/api/sections')
})

const selectedSection = computed(() => {
  return sections.value.find(section => section.id === form.values.sectionId)
})

watch(selectedSection, async (section) => {
  if (section) {
    // Si une section est sélectionnée, charger les groupes
    groups.value = await $fetch(`/api/sections/${section.id}/groups`)
  } else {
    // Si aucune section n'est sélectionnée, réinitialiser les groupes
    groups.value = []
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await authStore.register(
      values.email,
      values.password,
      values.name,
      values.role,
      values.sectionId,
      values.groupId
    )
    router.push('/login')
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error instanceof Error ? error.message : 'Une erreur est survenue',
      variant: 'destructive'
    })
  }
})
</script>

<template>
  <ClientOnly>
    <Form :form="form">
      <form @submit="onSubmit" class="space-y-4">

        <FormField name="email" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="email" placeholder="exemple@email.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="name" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="text" placeholder="Votre nom" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="password" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="password" placeholder="••••••••" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="role" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Rôle</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
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
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="sectionId" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Section</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
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
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="groupId" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Groupe</FormLabel>
            <FormControl>
              <Select 
                v-bind="componentField"
                :disabled="!form.values.sectionId || groups.length === 0"
                class="bg-white text-black border border-gray-300 rounded-md shadow-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <Button type="submit" class="w-full">
          S'inscrire
        </Button>
      </form>
    </Form>
  </ClientOnly>
</template> 