import { useAuthStore } from '~/stores/auth'

export const useAuthFetch = <T>(url: string, options: any = {}) => {
  const authStore = useAuthStore()
  
  const headers = {
    ...options.headers,
    ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
  }
  
  return useFetch<T>(url, {
    ...options,
    headers
  })
} 