<script setup lang="ts">
import { BadgeCheck, BadgeMinus, BadgeHelp } from 'lucide-vue-next'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
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

interface Props {
  participations: Participation[]
  userId: string
  isMissionStarted: boolean
  onParticipationUpdate: (status: 'PRESENT' | 'ABSENT' | 'INDEFINI') => Promise<void>
}

const props = defineProps<Props>()

const currentParticipation = computed(() => 
  props.participations.find(p => p.user.id === props.userId)
)
</script>

<template>
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
          :class="{ 'border-green-500 bg-green-500/10': currentParticipation?.status === 'PRESENT' }"
          @click="onParticipationUpdate('PRESENT')"
        >
          <div class="flex items-center gap-2">
            <BadgeCheck class="h-5 w-5" />
            <span>Je serai présent</span>
          </div>
          <Badge class="bg-green-500 hover:bg-green-600">Présent</Badge>
        </div>
        <div 
          class="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
          :class="{ 'border-red-500 bg-red-500/10': currentParticipation?.status === 'ABSENT' }"
          @click="onParticipationUpdate('ABSENT')"
        >
          <div class="flex items-center gap-2">
            <BadgeMinus class="h-5 w-5" />
            <span>Je ne serai pas présent</span>
          </div>
          <Badge class="bg-red-500 hover:bg-red-600">Absent</Badge>
        </div>
        <div 
          class="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
          :class="{ 'border-yellow-500 bg-yellow-500/10': currentParticipation?.status === 'INDEFINI' }"
          @click="onParticipationUpdate('INDEFINI')"
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
</template> 