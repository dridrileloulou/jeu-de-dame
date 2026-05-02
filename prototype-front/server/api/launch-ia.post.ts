export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { level } = body;

  // URL du service nuxt_IA (variable d'env sur Railway, localhost en dev)
  const IA_URL = process.env.NUXT_IA_URL || 'http://localhost:3001';

  console.log(`[API] Délégation du lancement du bot au service IA (${IA_URL})`);

  await $fetch(`${IA_URL}/api/launch-bot`, {
    method: 'POST',
    body: { level }
  });

  return { success: true };
});
