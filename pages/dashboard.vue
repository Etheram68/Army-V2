<script setup lang="ts">
import MissionSummary from '~/components/dashboard/MissionSummary.vue'
import MissionList from '~/components/dashboard/MissionList.vue'
import InfoCard from '~/components/dashboard/InfoCard.vue'

interface Participation {
  id: string
  userId: string
  missionId: string
  status: 'PRESENT' | 'ABSENT' | 'INDEFINI'
  updatedAt: Date
}

interface Mission {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  visibility: string
  participations: Participation[]
}

const { user } = useAuthStore()
const userId = user?.id
const { data: allMissions = ref<Mission[]>([]) } = await useAuthFetch<Mission[]>('/api/missions/dashboard')

// Missions en attente (status = INDEFINI)
const allPendingMissions = computed(() =>
  allMissions.value
    ?.filter((m: Mission) => !m.participations.some((p: Participation) => p.userId === userId))
    .sort((a: Mission, b: Mission) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    ?? []
)
const pendingMissionsPreview = computed(() =>
  allPendingMissions.value.slice(0, 5)
)

// Missions validées (status = PRESENT et à venir)
const upcomingMissions = computed(() =>
  allMissions.value?.filter((m: Mission) =>
    m.participations.some((p: Participation) => p.userId === userId && p.status === 'PRESENT') &&
    new Date(m.startDate) > new Date()
  ) ?? []
)

const infoItems = [
  'Mettez à jour vos disponibilités.',
  'Certificat médical à renouveler si expiré.',
  'Réunion de compagnie le 15 juin 2025.'
]
</script>

<template>
  <div class="space-y-8 px-4 py-6">
    <h1 class="text-2xl font-bold">Tableau de bord</h1>

    <!-- Résumé -->
    <MissionSummary
      :pending-count="allPendingMissions.length"
      :upcoming-count="upcomingMissions.length"
      :total-count="allMissions?.length ?? 0"
    />

    <!-- Bloc principal -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Nouvelles Missions -->
      <MissionList
        class="col-span-1 md:col-span-2"
        :missions="pendingMissionsPreview"
        title="Nouvelles missions"
        description="Missions en attente de votre réponse"
        status="EN_ATTENTE"
        empty-message="Aucune mission en attente."
      />

      <!-- Infos -->
      <InfoCard
        class="col-span-1"
        title="Informations"
        :items="infoItems"
      />
    </div>

    <!-- Missions à venir -->
    <MissionList
      :missions="upcomingMissions"
      title="Missions à venir"
      description="Participation confirmée"
      status="VALIDE"
      empty-message="Aucune mission à venir."
    />
  </div>
</template>