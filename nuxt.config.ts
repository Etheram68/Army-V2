// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'shadcn-nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@prisma/nuxt',
    '@vee-validate/nuxt',
    '@nuxtjs/google-fonts'
  ],
  css: ['~/assets/css/tailwind.css'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  runtimeConfig: {
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
    }
  },
  components: [
    { path: '~/components/ui', prefix: 'Ui' }, // Auto-import as <UiButton />
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {}
    }
  },
  googleFonts: {
    families: {
      Oxanium: true,
      'Source+Code+Pro': true
    },
    display: 'swap',
  }
})