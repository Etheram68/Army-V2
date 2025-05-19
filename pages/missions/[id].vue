<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAuthFetch } from '~/composables/useAuthFetch'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Calendar,
  Users,
  Building2,
  Users2,
  ArrowLeft,
  BadgeCheck,
  BadgeHelp,
  BadgeMinus
} from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'


interface User {
  id: string
  name: string | null
  role: 'RESERVISTE' | 'CHEF_GROUPE' | 'CHEF_SECTION' | 'COMMANDANT_UNITE'
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

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const mission = ref<Mission | null>(null)
const { toast } = useToast()

const { data, pending, error } = await useAuthFetch<Mission>(`/api/missions/${route.params.id}`)
if (data.value) {
  mission.value = data.value
}

const canEdit = computed(() => {
  if (!mission.value) return false
  const user = auth.user
  return user?.role === 'COMMANDANT_UNITE' || user?.role === 'CHEF_SECTION' || user?.role === 'CHEF_GROUPE'
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'bg-green-500'
    case 'ABSENT':
      return 'bg-red-500'
    case 'INDEFINI':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'Présent'
    case 'ABSENT':
      return 'Absent'
    case 'INDEFINI':
      return 'Indéfini'
    default:
      return status
  }
}

const updateParticipationStatus = async (status: 'PRESENT' | 'ABSENT' | 'INDEFINI') => {
  try {
    const res = await useAuthFetch(`/api/missions/${mission.value?.id}/participate`, {
      method: 'POST',
      body: { status }
    })
    if (res.error.value) {
      const message = res.error.value?.data?.message || 'Erreur inattendue lors de la mise à jour du statut.'
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive'
      })
    }
    // Rafraîchir les données
    await refreshNuxtData()
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  }
}

const participantsPerPage = 5
const currentPage = ref(1)
const selectedStatus = ref<'ALL' | 'PRESENT' | 'ABSENT' | 'INDEFINI'>('ALL')

const filteredParticipants = computed(() => {
  if (!mission.value) return []
  if (selectedStatus.value === 'ALL') return mission.value.participations
  return mission.value.participations.filter(p => p.status === selectedStatus.value)
})

const paginatedParticipants = computed(() => {
  const start = (currentPage.value - 1) * participantsPerPage
  return filteredParticipants.value.slice(start, start + participantsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredParticipants.value.length / participantsPerPage)
)

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const isMissionStarted = computed(() => {
  if (!mission.value) return false
  const now = new Date()
  return new Date(mission.value.startDate) <= now
})
</script>

<template>
  <div class="container mx-auto py-8 space-y-8">
    <!-- En-tête avec bouton retour -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-5 w-5" />
      </Button>
      <h1 class="text-3xl font-bold">Détails de la Mission</h1>
    </div>

    <Separator />

    <div v-if="pending" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Chargement des détails de la mission...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center space-y-4">
        <p class="text-destructive text-lg">Une erreur est survenue lors du chargement de la mission.</p>
        <Button @click="router.back()">Retour</Button>
      </div>
    </div>


    <div v-else-if="mission" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Informations principales -->
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">{{ mission.title }}</CardTitle>
            <CardDescription class="text-base">
              {{ mission.description }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Calendar class="h-5 w-5" />
                  <span>Date de début</span>
                </div>
                <p class="text-lg">{{ new Date(mission.startDate).toLocaleDateString("fr-FR") }}</p>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Calendar class="h-5 w-5" />
                  <span>Date de fin</span>
                </div>
                <p class="text-lg">{{ new Date(mission.endDate).toLocaleDateString("fr-FR") }}</p>
              </div>
            </div>

            <div class="h-px bg-border" />

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-if="mission.compagnie" class="space-y-2">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Building2 class="h-5 w-5" />
                  <span>Compagnie</span>
                </div>
                <p class="text-lg">{{ mission.compagnie.name }}</p>
              </div>
              <div v-if="mission.section" class="space-y-2">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Users2 class="h-5 w-5" />
                  <span>Section</span>
                </div>
                <p class="text-lg">{{ mission.section.name }}</p>
              </div>
              <div v-if="mission.group" class="space-y-2">
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Users class="h-5 w-5" />
                  <span>Groupe</span>
                </div>
                <p class="text-lg">{{ mission.group.name }}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter v-if="canEdit">
            <Button class="w-full">Modifier la mission</Button>
          </CardFooter>
        </Card>

        <!-- Liste des participants avec filtres et pagination -->
        <Card class="max-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              {{ filteredParticipants.length }} participant(s)
            </CardDescription>
            <!-- Filtres -->
            <div class="flex gap-2 mt-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-primary text-white': selectedStatus === 'ALL' }"
                @click="selectedStatus = 'ALL'; currentPage = 1"
              >
                Tous
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-green-500 text-white': selectedStatus === 'PRESENT' }"
                @click="selectedStatus = 'PRESENT'; currentPage = 1"
              >
                Présents
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-red-500 text-white': selectedStatus === 'ABSENT' }"
                @click="selectedStatus = 'ABSENT'; currentPage = 1"
              >
                Absents
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-yellow-500 text-white': selectedStatus === 'INDEFINI' }"
                @click="selectedStatus = 'INDEFINI'; currentPage = 1"
              >
                Indéfinis
              </Button>
            </div>
          </CardHeader>

          <!-- Liste défilante -->
          <CardContent class="overflow-y-auto flex-1">
            <div class="space-y-4">
              <div
                v-for="participation in paginatedParticipants"
                :key="participation.id"
                class="flex items-center justify-between p-4 rounded-lg border"
              >
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-lg font-medium">
                      {{ participation.user.name?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium">{{ participation.user.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ participation.user.role }}</p>
                  </div>
                </div>
                <Badge :class="getStatusColor(participation.status)">
                  {{ getStatusText(participation.status) }}
                </Badge>
              </div>
            </div>
          </CardContent>

          <!-- Pagination statique -->
          <CardFooter class="justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Précédent
            </Button>
            <p class="text-sm text-muted-foreground">
              Page {{ currentPage }} sur {{ totalPages }}
            </p>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Suivant
            </Button>
          </CardFooter>
        </Card>


      </div>

      <!-- Carte de participation -->
      <div class="lg:col-span-1">
        <Card v-if="!isMissionStarted">
          <CardHeader>
            <CardTitle>Ma Participation</CardTitle>
            <CardDescription>
              Indiquez votre disponibilité pour cette mission
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 gap-4">
              <div 
                class="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                :class="{ 'border-green-500 bg-green-500/10': mission.participations.find(p => p.user.id === auth.user?.id)?.status === 'PRESENT' }"
                @click="updateParticipationStatus('PRESENT')"
              >
                <div class="flex items-center gap-2">
                  <BadgeCheck class="h-5 w-5" />
                  <span>Je serai présent</span>
                </div>
                <Badge class="bg-green-500 hover:bg-green-600">Présent</Badge>
              </div>
              <div 
                class="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                :class="{ 'border-red-500 bg-red-500/10': mission.participations.find(p => p.user.id === auth.user?.id)?.status === 'ABSENT' }"
                @click="updateParticipationStatus('ABSENT')"
              >
                <div class="flex items-center gap-2">
                  <BadgeMinus class="h-5 w-5" />
                  <span>Je ne serai pas présent</span>
                </div>
                <Badge class="bg-red-500 hover:bg-red-600">Absent</Badge>
              </div>
              <div 
                class="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                :class="{ 'border-yellow-500 bg-yellow-500/10': mission.participations.find(p => p.user.id === auth.user?.id)?.status === 'INDEFINI' }"
                @click="updateParticipationStatus('INDEFINI')"
              >
                <div class="flex items-center gap-2">
                  <BadgeHelp class="h-5 w-5" />
                  <span>Je ne sais pas encore</span>
                </div>
                <Badge class="bg-yellow-500 hover:bg-yellow-600">Indécis</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card v-else>
          <CardHeader>
            <CardTitle>La mission a déjà commencé</CardTitle>
            <CardDescription>
              Vous ne pouvez plus modifier votre participation.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template> 