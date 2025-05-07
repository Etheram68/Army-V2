<script setup lang="ts">
import RegisterForm from '~/components/auth/RegisterForm.vue';

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})
</script>

<template>
  <div class="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div class="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
      <div class="absolute inset-0 bg-zinc-900" />
      <div class="relative z-20 flex items-center text-lg font-medium">
        <!-- <Logo class="mr-2 h-6 w-6" /> -->
        Votre Application
      </div>
      <div class="relative z-20 mt-auto">
        <blockquote class="space-y-2">
          <p class="text-lg">
            "Cette application a changé ma façon de travailler. Je ne peux plus m'en passer !"
          </p>
          <footer class="text-sm">Sofia Davis</footer>
        </blockquote>
      </div>
    </div>
    <div class="lg:p-8">
      <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
          <h1 class="text-2xl font-semibold tracking-tight">
            Créer un compte
          </h1>
          <p class="text-sm text-muted-foreground">
            Entrez vos informations pour créer votre compte
          </p>
        </div>
        <RegisterForm />
        <p class="px-8 text-center text-sm text-muted-foreground">
          Vous avez déjà un compte ?
          <NuxtLink
            to="/login"
            class="underline underline-offset-4 hover:text-primary"
          >
            Connectez-vous
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template> 