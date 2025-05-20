<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="space-y-12 py-10 container mx-auto">
    <!-- Titre principal -->
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-bold tracking-tight">Bienvenue sur la plateforme des missions réservistes</h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Simplifiez la planification, le suivi et la coordination de vos missions grâce à une interface intuitive, pensée pour les chefs de groupe, de section et le commandement.
      </p>
    </section>

    <!-- Fonctionnalités clés -->
    <section class="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Ce que vous pouvez faire ici</CardTitle>
          <CardDescription>Une plateforme centralisée pour toute la chaîne de commandement</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Créer et suivre des missions</li>
            <li>Gérer la disponibilité des réservistes</li>
            <li>Recevoir des alertes importantes (médicales, aptitudes, documents)</li>
            <li>Consulter un planning annuel clair et structuré</li>
            <li>Superviser les groupes, sections et compagnies</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pour qui ?</CardTitle>
          <CardDescription>Une interface adaptée à chaque rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 list-disc list-inside text-muted-foreground">
            <li><strong>Réservistes</strong> : consulter ses missions et ses disponibilités</li>
            <li><strong>Chefs de groupe</strong> : organiser et encadrer les missions</li>
            <li><strong>Chefs de section</strong> : planifier et superviser les groupes</li>
            <li><strong>Commandants</strong> : vision globale, alertes et contrôle des affectations</li>
          </ul>
        </CardContent>
      </Card>
    </section>

    <!-- Appel à l'action -->
    <section class="text-center pt-6">
      <NuxtLink
        v-if="!auth.user"
        to="/login"
        class="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
      >
        Se connecter pour accéder à la plateforme
      </NuxtLink>
      <NuxtLink
        v-else
        to="/missions"
        class="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
      >
        Accéder aux missions
      </NuxtLink>
    </section>
  </div>
</template>
