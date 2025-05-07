<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue';

definePageMeta({
  layout: 'auth'
})
</script>
 
<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <LoginForm />
  </div>
</template> 