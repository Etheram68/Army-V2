<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  mission: any
  status: 'EN_ATTENTE' | 'VALIDE'
}>()

const badgeVariant = computed(() =>
  props.status === 'EN_ATTENTE' ? 'destructive' : 'success'
)

const badgeLabel = computed(() =>
  props.status === 'EN_ATTENTE' ? 'En attente' : 'Validée'
)

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date))
}
</script>

<template>
  <NuxtLink :to="`/missions/${mission.id}`" class="block">
    <div
      class="border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-2 hover:text-primary hover:bg-gray-50 transition-colors"
    >
      <div>
        <h3 class="font-semibold text-lg">{{ mission.title }}</h3>
        <p class="text-sm text-muted-foreground">
          {{ formatDate(mission.startDate) }} → {{ formatDate(mission.endDate) }}
        </p>
        <p class="text-sm mt-1">{{ mission.visibility }}</p>
      </div>
      <div class="flex items-center justify-end">
        <Badge :variant="badgeVariant">
          {{ badgeLabel }}
        </Badge>
      </div>
    </div>
  </NuxtLink>
</template>
