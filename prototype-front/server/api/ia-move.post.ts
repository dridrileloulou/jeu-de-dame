export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // URL du service nuxt_IA (variable d'env sur Railway, localhost en dev)
  const IA_URL = process.env.NUXT_IA_URL || 'http://localhost:3001';

  try {
    const response = await $fetch(`${IA_URL}/api/dames`, {
      method: 'POST',
      body: body
    });
    return response;
  } catch (err) {
    console.error('[Proxy IA] Erreur lors de l\'appel à nuxt_IA:', err);
    throw createError({
      statusCode: 500,
      message: 'Erreur de communication avec le service IA'
    });
  }
});
