<script setup lang="ts">
import { Calendar, Building2, Users2, Users, SquarePenIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '~/components/ui/card'

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

interface Props {
  mission: Mission
  canEdit: boolean
}

defineProps<Props>()
</script>

<template>
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
      <Button class="w-full">
        <NuxtLink :to="`/missions/${mission.id}/edit` " class="flex items-center gap-2">
            <SquarePenIcon class="w-5 h-5" />
            Modifier la mission
          </NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template> 