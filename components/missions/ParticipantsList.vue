<script setup lang="ts">
import { ref, computed } from 'vue'

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

interface Props {
  participations: Participation[]
}

const props = defineProps<Props>()

const participantsPerPage = 5
const currentPage = ref(1)
const selectedStatus = ref<'ALL' | 'PRESENT' | 'ABSENT' | 'INDEFINI'>('ALL')

const filteredParticipants = computed(() => {
  if (selectedStatus.value === 'ALL') return props.participations
  return props.participations.filter(p => p.status === selectedStatus.value)
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
</script>

<template>
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

    <!-- Pagination -->
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
</template> 