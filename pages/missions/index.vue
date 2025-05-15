<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAuthFetch } from '~/composables/useAuthFetch'
import Spinner from '~/components/ui/spinner.vue'
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
import { CalendarIcon, UsersIcon, PlusIcon } from 'lucide-vue-next'
import { Separator } from '~/components/ui/separator'

interface Mission {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  participantsCount: number
}

const auth = useAuthStore()
const page = ref(1)
const total = ref(0)
const missions = ref<Mission[]>([])

const canCreate = ['CHEF_GROUPE', 'CHEF_SECTION', 'COMMANDANT_UNITE'].includes(auth.user?.role || '')

// 🔁 Chargement des missions à chaque changement de filtre/page
watchEffect(async () => {
  const { data } = await useAuthFetch<{ missions: Mission[], total: number }>('/api/missions', {
    query: {
      page: page.value
    }
  })
  if (data.value) {
    missions.value = data.value.missions
    total.value = data.value.total
  }
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
    <div v-if="!missions.length" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center space-y-4">
        <Spinner class="w-8 h-8 mx-auto" />
        <p class="text-muted-foreground">Chargement des missions...</p>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="mission in missions" :key="mission.id" class="group hover:shadow-lg transition-all duration-300">
        <CardHeader class="space-y-1">
          <div class="flex items-start justify-between">
            <CardTitle class="text-xl group-hover:text-primary transition-colors">
              {{ mission.title }}
            </CardTitle>
            <Badge variant="default" class="ml-2">
              {{ mission.participantsCount }} <UsersIcon class="w-4 h-4 ml-1" />
            </Badge>
          </div>
          <CardDescription class="line-clamp-2 text-base">
            {{ mission.description }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon class="w-4 h-4" />
              <span>Du {{ new Date(mission.startDate).toLocaleDateString() }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon class="w-4 h-4" />
              <span>Au {{ new Date(mission.endDate).toLocaleDateString() }}</span>
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
  </div>
</template>