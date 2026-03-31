import { spawn } from 'child_process';
import path from 'path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { level } = body;

  const levelMap: Record<string, string> = {
    facile: 'play_ia_facile.js',
    normal: 'play_ia_moyen.js',
    difficile: 'play_ia_difficile.js',
    expert: 'play_ia_impossible.js'
  };

  const scriptName = levelMap[level];
  if (!scriptName) {
    return createError({ statusCode: 400, message: 'Invalid level specified' });
  }

  // Utilisation d'un chemin relatif pour que le projet soit portable pour les testeurs
  const scriptDir = path.resolve(process.cwd(), '../nuxt_IA/ia_levels/');
  const scriptPath = path.resolve(scriptDir, scriptName);

  console.log(`[API] Lancement du bot IA : node ${scriptName}`);

  // Lance le script en arrière-plan sans bloquer le serveur
  const child = spawn('node', [scriptPath], {
    cwd: scriptDir,
    detached: true,
    stdio: 'ignore'
  });

  child.unref(); // Permet au serveur de continuer sa vie sans attendre la fermeture du bot

  return { success: true, message: `Bot ${scriptName} lancé avec succès.` };
});
