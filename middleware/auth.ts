export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const isAuthenticated = await authStore.checkAuth()

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    return navigateTo('/login')
  }

  // Si la route nécessite des droits d'administrateur
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return navigateTo('/')
  }
}) 