<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

interface Props {
  title?: string
}

defineProps<Props>()

const router = useRouter()
</script>

<template>
  <div class="flex items-center gap-4">
    <Button variant="ghost" size="icon" @click="router.back()">
      <ArrowLeft class="h-5 w-5" />
    </Button>
    <h1 class="text-3xl font-bold">{{ title || 'Détails de la Mission' }}</h1>
  </div>
</template> 