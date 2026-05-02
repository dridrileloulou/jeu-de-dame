#!/bin/bash
# Exporte l'URL du frontend AVANT de changer PORT pour nuxt_IA
export FRONTEND_URL="http://localhost:${PORT:-3000}"
export PUPPETEER_EXECUTABLE_PATH="${PUPPETEER_EXECUTABLE_PATH:-/usr/bin/chromium}"

# Lance nuxt_IA en arrière-plan sur le port 3001
PORT=3001 node /app/nuxt_IA/.output/server/index.mjs &

# Lance prototype-front au premier plan sur le PORT Railway
node /app/prototype-front/.output/server/index.mjs
