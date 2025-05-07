<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="space-y-8">
    <section class="text-center space-y-4">
      <h1 class="text-4xl font-bold">Bienvenue sur Mon Application</h1>
      <p class="text-xl text-muted-foreground">
        Une application moderne construite avec Nuxt 3
      </p>
    </section>

    <section class="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
          <CardDescription>Découvrez ce que notre application peut faire pour vous</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li>Authentification sécurisée</li>
            <li>Interface moderne et responsive</li>
            <li>Gestion des utilisateurs</li>
            <li>Tableau de bord personnalisé</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technologies</CardTitle>
          <CardDescription>Les technologies utilisées dans ce projet</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li>Nuxt 3</li>
            <li>Vue 3</li>
            <li>TypeScript</li>
            <li>Prisma</li>
            <li>Tailwind CSS</li>
            <li>Shadcn UI</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  </div>
</template> 