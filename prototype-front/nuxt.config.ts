export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    head: {
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }]
    }
  },

  modules: ['nuxt-auth-utils'],

  nitro: {
    experimental: { websocket: true }
  }
})