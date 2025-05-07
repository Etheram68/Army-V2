<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <header class="border-b">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold">
        Mon Application
      </NuxtLink>
      
      <nav class="flex items-center gap-4">
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