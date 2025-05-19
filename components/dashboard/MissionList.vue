<script setup lang="ts">
import MissionCard from './MissionCard.vue'

interface Mission {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  visibility: string
  participations: Array<{
    id: string
    userId: string
    missionId: string
    status: 'PRESENT' | 'ABSENT' | 'INDEFINI'
    updatedAt: Date
  }>
}

interface Props {
  missions: Mission[]
  title: string
  description: string
  status: 'EN_ATTENTE' | 'VALIDE'
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: 'Aucune mission disponible.'
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="missions.length" class="space-y-4">
        <MissionCard
          v-for="mission in missions"
          :key="mission.id"
          :mission="mission"
          :status="status"
        />
      </div>
      <p v-else class="text-muted-foreground text-sm">
        {{ emptyMessage }}
      </p>
    </CardContent>
  </Card>
</template> 