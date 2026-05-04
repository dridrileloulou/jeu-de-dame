export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const IA_URL = process.env.NUXT_IA_URL || 'http://127.0.0.1:3001'
  try {
    return await $fetch(`${IA_URL}/api/coach`, { method: 'POST', body })
  } catch {
    return { analysis: null }
  }
})
