<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAuthFetch } from '~/composables/useAuthFetch'
import { Spinner } from '~/components/ui/spinner'
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { CalendarIcon, UsersIcon, PlusIcon, AlertCircle, Building2, Users2, Users } from 'lucide-vue-next'
import { Separator } from '~/components/ui/separator'

interface Mission {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  participantsCount: number
  hasParticipated: boolean,
  compagnie: { name: string } | null,
  section: { name: string } | null,
  group: { name: string } | null
}

const auth = useAuthStore()
const page = ref(1)
const total = ref(0)
const missions = ref<Mission[]>([])

const canCreate = ['CHEF_GROUPE', 'CHEF_SECTION', 'COMMANDANT_UNITE'].includes(auth.user?.role || '')

// 🔁 Chargement des missions à chaque changement de filtre/page
const loading = ref(true)
const totalPages = computed(() => Math.ceil(total.value / 9)) // 9 missions par page (comme 3 colonnes * 3 lignes)

function goToPage(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    page.value = p
  }
}

watchEffect(async () => {
  loading.value = true
  const { data } = await useAuthFetch<{ missions: Mission[], total: number }>('/api/missions', {
    query: { page: page.value }
  })
  if (data.value) {
    missions.value = data.value.missions
    total.value = data.value.total
  }
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto py-8 space-y-8">
    <!-- En-tête -->
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold tracking-tight">Missions</h1>
        </div>
        <Button v-if="canCreate" size="lg" asChild>
          <NuxtLink to="/missions/create" class="flex items-center gap-2">
            <PlusIcon class="w-5 h-5" />
            Créer une mission
          </NuxtLink>
        </Button>
      </div>
      <Separator />
    </div>

    <!-- Liste des missions -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center space-y-4">
        <Spinner class="w-8 h-8 mx-auto" />
        <p class="text-muted-foreground">Chargement des missions...</p>
      </div>
    </div>

    <div v-else-if="missions.length === 0" class="flex flex-col justify-center items-center min-h-[400px] text-center space-y-4 text-muted-foreground">
      <AlertCircle class="w-16 h-16 text-gray-400" />
      <p class="text-lg font-semibold">Aucune mission pour le moment</p>
      <p class="max-w-xs text-sm text-gray-500">Tout est calme pour l’instant, mais restez prêt ! Dès qu’une mission arrive, vous serez informé.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="mission in missions"
        :key="mission.id"
        class="group hover:shadow-lg transition-all duration-300 relative"
      >
        <CardHeader class="space-y-1">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <CardTitle class="text-xl group-hover:text-primary transition-colors">
                {{ mission.title }}
              </CardTitle>
            </div>
            <Badge 
              v-if="!mission.hasParticipated"
              variant="success"
              class="absolute -top-1.5 -left-3 bg-green-500 hover:bg-green-600 z-10 rounded-md shadow-md px-2 py-1 text-xs"
            >
              Nouveau
            </Badge>
            <Badge variant="default" class="ml-2">
              {{ mission.participantsCount }} <UsersIcon class="w-4 h-4 ml-1" />
            </Badge>
          </div>
          <CardDescription class="line-clamp-2 text-base">
            {{ mission.description }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-3">
            <!-- Ligne Dates + Portée -->
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-sm text-muted-foreground">
              <!-- Bloc Dates -->
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>Du {{ new Date(mission.startDate).toLocaleDateString("fr-FR") }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  <span>Au {{ new Date(mission.endDate).toLocaleDateString("fr-FR") }}</span>
                </div>
              </div>

              <!-- Bloc Portée -->
              <div class="space-y-1">
                
                <div v-if="mission.group" class="flex items-center gap-2">
                  <Users class="h-4 w-4" />
                  <span class="text-foreground font-medium">{{ mission.group.name }}</span>
                </div>
                <div v-else-if="mission.section" class="flex items-center gap-2">
                  <Users2 class="h-4 w-4" />
                  <span class="text-foreground font-medium">{{ mission.section.name }}</span>
                </div>
                <div v-else-if="mission.compagnie" class="flex items-center gap-2">
                  <Building2 class="h-4 w-4" />
                  <span class="text-foreground font-medium">{{ mission.compagnie.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" class="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
            <NuxtLink :to="`/missions/${mission.id}`" class="flex items-center justify-center gap-2">
              Voir les détails
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
    <!-- Pagination -->
    <div class="flex justify-center mt-8">
      <div class="inline-flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          :disabled="page === 1"
          @click="goToPage(page - 1)"
        >
          ←
        </Button>

        <div class="flex items-center gap-1">
          <Button
            v-for="p in totalPages"
            :key="p"
            :variant="p === page ? 'default' : 'ghost'"
            class="w-10 h-10"
            @click="goToPage(p)"
          >
            {{ p }}
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          :disabled="page === totalPages"
          @click="goToPage(page + 1)"
        >
          →
        </Button>
      </div>
    </div>
  </div>
</template>