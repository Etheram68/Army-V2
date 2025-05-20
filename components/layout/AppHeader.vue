<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const scrolled = ref(false)

onMounted(() => {
  themeStore.initTheme()
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 10
  })
})
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur transition-shadow duration-300"
    :class="{ 'shadow-sm': scrolled }"
  >
    <div
      class="container mx-auto h-16 px-4 flex items-center justify-between 
             transition-all duration-500 ease-out opacity-100 translate-y-0"
    >
      <NuxtLink to="/" class="text-xl font-bold">
        Mon Application
      </NuxtLink>

      <nav class="flex items-center gap-4">
        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/dashboard" class="hover:text-primary">Tableau de bord</NuxtLink>
          <NuxtLink to="/missions" class="hover:text-primary">Missions</NuxtLink>
          <template v-if="authStore.isAdmin">
            <NuxtLink to="/admin" class="hover:text-primary">Administration</NuxtLink>
          </template>
          <div class="flex items-center gap-2">
            <Sun class="h-4 w-4" />
            <Switch
              :model-value="themeStore.isDark"
              @update:model-value="themeStore.toggleTheme"
            />
            <Moon class="h-4 w-4" />
          </div>
          <Button variant="ghost" @click="authStore.logout">Déconnexion</Button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hover:text-primary">Connexion</NuxtLink>
          <NuxtLink to="/register" class="hover:text-primary">Inscription</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>
