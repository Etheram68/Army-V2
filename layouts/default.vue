<script setup lang="ts">
import AppFooter from '~/components/layout/AppFooter.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import { useAuthStore } from '~/stores/auth'

// Vérification de l'authentification au chargement de l'application
const authStore = useAuthStore()
onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template> 