export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }]
    }
  },

  modules: ['nuxt-auth-utils'],

  nitro: {
    experimental: { websocket: true }
  }
})