<script setup lang="ts">
interface Props {
  pendingCount: number
  upcomingCount: number
  totalCount: number
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <Card>
      <CardContent class="flex items-center justify-between py-4">
        <div>
          <p class="text-sm text-muted-foreground">Missions en attente</p>
          <p class="text-2xl font-bold">{{ pendingCount }}</p>
        </div>
        <Badge variant="destructive">En attente</Badge>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="flex items-center justify-between py-4">
        <div>
          <p class="text-sm text-muted-foreground">Missions à venir</p>
          <p class="text-2xl font-bold">{{ upcomingCount }}</p>
        </div>
        <Badge variant="success">Validées</Badge>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="flex items-center justify-between py-4">
        <div>
          <p class="text-sm text-muted-foreground">Total missions</p>
          <p class="text-2xl font-bold">{{ totalCount }}</p>
        </div>
        <Badge variant="outline">Toutes</Badge>
      </CardContent>
    </Card>
  </div>
</template> 