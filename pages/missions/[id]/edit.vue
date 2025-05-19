<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormItem, FormField, FormControl, FormLabel, FormMessage
} from '@/components/ui/form'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'
import { useAuthStore } from '~/stores/auth'
import MissionHeader from '~/components/missions/MissionHeader.vue'

interface Mission {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  visibility: 'GROUPE' | 'SECTION' | 'COMPAGNIE'
  compagnie?: { id: string; name: string } | null
  section?: { id: string; name: string } | null
  group?: { id: string; name: string } | null
}

const { toast } = useToast()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const missionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  visibility: z.enum(['GROUPE', 'SECTION', 'COMPAGNIE']),
  groupId: z.string().optional(),
  sectionId: z.string().optional(),
  compagnieId: z.string().optional(),
})

const { handleSubmit, errors, defineField, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(missionSchema),
})

const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')
const [startDate, startDateAttrs] = defineField('startDate')
const [endDate, endDateAttrs] = defineField('endDate')
const [visibility, visibilityAttrs] = defineField('visibility')
const [groupId, groupIdAttrs] = defineField('groupId')
const [sectionId, sectionIdAttrs] = defineField('sectionId')
const [compagnieId, compagnieIdAttrs] = defineField('compagnieId')

// Données dynamiques
const compagnies = ref<{ id: string; name: string }[]>([])
const sections = ref<{ id: string; name: string }[]>([])
const groups = ref<{ id: string; name: string }[]>([])

// Chargement des données de la mission
const { data: mission, pending } = await useAuthFetch<Mission>(`/api/missions/${route.params.id}`)

// Chargement des Compagnies au montage
onMounted(async () => {
  try {
    const res = await $fetch('/api/compagnies')
    compagnies.value = res
  } catch (e) {
    toast({
      title: "Erreur",
      description: "Impossible de charger les Compagnies.",
      variant: 'destructive'
    })
  }
})

// Watch pour charger les sections liés à la compagnie sélectionnée
watch(compagnieId, async (compagnieId) => {
  if (!compagnieId || visibility.value === 'COMPAGNIE') return
  try {
    const res = await $fetch(`/api/compagnies/${compagnieId}/sections`)
    sections.value = res
  } catch (e) {
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les sections.',
      variant: 'destructive'
    })
  }
})

// Watch pour charger les groupes liés à la section sélectionnée
watch(sectionId, async (sectionId) => {
  if (!sectionId || visibility.value !== 'GROUPE') return
  try {
    const res = await $fetch(`/api/sections/${sectionId}/groups`)
    groups.value = res
  } catch (e) {
    toast({
      title: 'Erreur',
      description: 'Impossible de charger les groupes.',
      variant: 'destructive'
    })
  }
})

// Initialisation des valeurs du formulaire avec les données de la mission
watch(mission, (newMission: Mission | null) => {
  if (newMission) {
    setFieldValue('title', newMission.title)
    setFieldValue('description', newMission.description || '')
    setFieldValue('startDate', new Date(newMission.startDate).toISOString().split('T')[0])
    setFieldValue('endDate', new Date(newMission.endDate).toISOString().split('T')[0])
    setFieldValue('visibility', newMission.visibility)
    setFieldValue('compagnieId', newMission.compagnie?.id)
    setFieldValue('sectionId', newMission.section?.id)
    setFieldValue('groupId', newMission.group?.id)
  }
}, { immediate: true })

const isSubmitting = ref(false)

const onSubmit = handleSubmit(async (formValues) => {
  try {
    isSubmitting.value = true

    const payload = {
      ...formValues,
      startDate: new Date(formValues.startDate).toISOString(),
      endDate: new Date(formValues.endDate).toISOString(),
    }

    const response = await useAuthFetch(`/api/missions/${route.params.id}`, {
      method: 'PUT',
      body: payload
    })
    if (response.error.value) {
      const message = response.error.value?.data?.message || 'Erreur inattendue lors de la mise à jour de la mission.'
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Mission mise à jour',
        description: 'La mission a été modifiée avec succès',
      })
      router.push(`/missions/${route.params.id}`)
    }
  } catch (error: any) {
    toast({
      title: 'Erreur',
      description: error?.data?.message ?? 'Erreur lors de la mise à jour de la mission',
      variant: 'destructive',
    })
  } finally {
    isSubmitting.value = false
  }
})

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
  requiresAdmin: false
})
</script>

<template>
  <div class="container mx-auto py-8 space-y-8">
    <MissionHeader :title="title || 'Modifier la mission'" />

    <ClientOnly>
      <Form v-if="!pending">
        <form @submit.prevent="onSubmit" class="space-y-6 max-w-xl mx-auto mt-10">
          <!-- Titre -->
          <FormField name="title" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input v-bind="componentField" v-model="title" placeholder="Nom de la mission" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Description -->
          <FormField name="description" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea v-bind="componentField" v-model="description" placeholder="Détail de la mission" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="flex flex-col md:flex-row gap-4">
            <!-- Date de début -->
            <FormField name="startDate" v-slot="{ componentField }">
              <FormItem class="w-full">
                <FormLabel>Début</FormLabel>
                <FormControl>
                  <Input type="date" v-bind="componentField" v-model="startDate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Date de fin -->
            <FormField name="endDate" v-slot="{ componentField }">
              <FormItem class="w-full">
                <FormLabel>Fin</FormLabel>
                <FormControl>
                  <Input type="date" v-bind="componentField" v-model="endDate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Visibilité -->
          <FormField name="visibility" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Visibilité</FormLabel>
              <FormControl>
                <Select v-bind="componentField" v-model="visibility">
                  <SelectTrigger><SelectValue placeholder="Portée de la mission" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="GROUPE">Groupe</SelectItem>
                      <SelectItem value="SECTION">Section</SelectItem>
                      <SelectItem value="COMPAGNIE">Compagnie</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Compagnie -->
          <FormField name="compagnieId" v-if="visibility" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Compagnie concernée</FormLabel>
              <FormControl>
                <Select v-bind="componentField" v-model="compagnieId">
                  <SelectTrigger><SelectValue placeholder="Choisir une compagnie" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="compagnie in compagnies" :key="compagnie.id" :value="compagnie.id">
                        {{ compagnie.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Section -->
          <FormField name="sectionId" v-if="visibility === 'SECTION' || visibility === 'GROUPE'" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Section concernée</FormLabel>
              <FormControl>
                <Select v-bind="componentField" v-model="sectionId">
                  <SelectTrigger><SelectValue placeholder="Choisir une section" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="section in sections" :key="section.id" :value="section.id">
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
          <FormField name="groupId" v-if="visibility === 'GROUPE'" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Groupe concerné</FormLabel>
              <FormControl>
                <Select v-bind="componentField" v-model="groupId">
                  <SelectTrigger><SelectValue placeholder="Choisir un groupe" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="group in groups" :key="group.id" :value="group.id">
                        {{ group.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Bouton -->
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mise à jour en cours...' : 'Mettre à jour la mission' }}
          </Button>
        </form>
      </Form>
    </ClientOnly>
  </div>
</template> 