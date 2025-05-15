<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// Initialiser le thème au montage du composant
onMounted(() => {
  themeStore.initTheme()
})
</script>

<template>
  <header class="border-b">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold">
        Mon Application
      </NuxtLink>
      
      <nav class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Sun class="h-4 w-4" />
          <Switch
            :model-value="themeStore.isDark"
            @update:model-value="themeStore.toggleTheme"
          />
          <Moon class="h-4 w-4" />
        </div>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/dashboard" class="hover:text-primary">
            Tableau de bord
          </NuxtLink>
          <template v-if="authStore.isAdmin">
            <NuxtLink to="/admin" class="hover:text-primary">
              Administration
            </NuxtLink>
          </template>
          <Button variant="ghost" @click="authStore.logout">
            Déconnexion
          </Button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="hover:text-primary">
            Connexion
          </NuxtLink>
          <NuxtLink to="/register" class="hover:text-primary">
            Inscription
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template> 