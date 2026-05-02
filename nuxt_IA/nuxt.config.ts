// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  },

  // Runtime configuration – secrets only server‑side
  runtimeConfig: {
    // Gemini API key (will be read from .env as GEMINI_API_KEY)
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    public: {}
  }
})
