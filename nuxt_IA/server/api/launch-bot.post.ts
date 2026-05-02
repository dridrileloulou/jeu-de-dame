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
    throw createError({ statusCode: 400, message: 'Niveau invalide' });
  }

  const scriptDir = process.env.IA_LEVELS_DIR || path.resolve('/app/nuxt_IA/ia_levels');
  const scriptPath = path.join(scriptDir, scriptName);

  console.log(`[nuxt_IA] Lancement du bot : ${scriptName}`);

  const child = spawn(process.execPath, [scriptPath], {
    cwd: scriptDir,
    detached: true,
    stdio: 'ignore'
  });

  child.unref();

  return { success: true };
});
