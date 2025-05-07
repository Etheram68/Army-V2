import { defineStore } from 'pinia'
import { jwtVerify } from 'jose'

interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
}

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN'
  },

  actions: {
    async login(email: string, password: string) {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (error.value) throw new Error(error.value.message)

      if (data.value?.token && data.value?.user) {
        this.token = data.value.token
        this.user = data.value.user as User
      }
    },

    async register(email: string, password: string, name?: string) {
      const { data, error } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })

      if (error.value) throw new Error(error.value.message)

      if (data.value?.token && data.value?.user) {
        this.token = data.value.token
        this.user = data.value.user as User
      }
    },

    async logout() {
      await useFetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      this.token = null
    },
    
    async checkAuth() {
      if (!this.token) return false

      const { data } = await useFetch('/api/auth/check', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      if (data.value?.user) {
        this.user = data.value.user as User
        return true
      }

      this.token = null
      this.user = null
      return false
    }
  },

  persist: true
})
