<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthFetch } from '~/composables/useAuthFetch'
import { useAuthStore } from '~/stores/auth'
import MissionHeader from '~/components/missions/MissionHeader.vue'
import MissionDetails from '~/components/missions/MissionDetails.vue'
import ParticipantsList from '~/components/missions/ParticipantsList.vue'
import ParticipationCard from '~/components/missions/ParticipationCard.vue'

const route = useRoute()
const auth = useAuthStore()

interface User {
  id: string
  name: string | null
  role: 'RESERVISTE' | 'CHEF_GROUPE' | 'CHEF_SECTION' | 'COMMANDANT_UNITE'
  sectionId?: string
  groupId?: string
}

interface Participation {
  id: string
  user: User
  status: 'PRESENT' | 'ABSENT' | 'INDEFINI'
  joinedAt: Date
}

interface Mission {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  visibility: string
  compagnie: { id: string; name: string } | null
  section: { id: string; name: string } | null
  group: { id: string; name: string } | null
  createdBy: User
  participations: Participation[]
}

const mission = ref<Mission | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)

// Récupération des données de la mission
const { data, pending, error: fetchError } = await useAuthFetch<Mission>(`/api/missions/${route.params.id}`)

// Mise à jour des refs avec les données
watch([data, pending, fetchError], ([newData, newPending, newError]) => {
  mission.value = newData
  loading.value = newPending
  error.value = newError as Error | null
}, { immediate: true })

// Vérification des permissions
const canEdit = computed(() => {
  if (!mission.value || !auth.user) return false
  return auth.user.role === 'COMMANDANT_UNITE' || 
         (auth.user.role === 'CHEF_SECTION' && mission.value.section?.id === auth.user.sectionId) ||
         (auth.user.role === 'CHEF_GROUPE' && mission.value.group?.id === auth.user.groupId)
})

// Vérification si la mission a commencé
const isMissionStarted = computed(() => {
  if (!mission.value) return false
  return new Date(mission.value.startDate) <= new Date()
})

// Gestion de la participation
const handleParticipation = async (status: 'PRESENT' | 'ABSENT' | 'INDEFINI') => {
  try {
    await useAuthFetch(`/api/missions/${route.params.id}/participate`, {
      method: 'POST',
      body: { status }
    })
    await refreshNuxtData()
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la participation:', err)
  }
}
</script>

<template>
  <div class="container mx-auto py-8 space-y-8">
    <MissionHeader :title="mission?.title || ''" />

    <div v-if="loading" class="flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      Une erreur est survenue lors du chargement de la mission.
    </div>

    <div v-else-if="mission" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <MissionDetails
          :mission="mission"
          :can-edit="canEdit"
        />

        <ParticipantsList
          :participations="mission.participations"
        />
      </div>

      <div class="lg:col-span-1">
        <ParticipationCard
          v-if="auth.user"
          :participations="mission.participations"
          :user-id="auth.user.id"
          :is-mission-started="isMissionStarted"
          :on-participation-update="handleParticipation"
        />
      </div>
    </div>

    <div v-else class="text-center text-muted-foreground">
      Mission non trouvée
    </div>
  </div>
</template> 