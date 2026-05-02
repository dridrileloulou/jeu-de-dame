FROM node:22-slim

RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates procps libxss1 \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libpangocairo-1.0-0 \
    libnss3 chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY . .

RUN cd /app/prototype-front && npm ci && npm run build
RUN cd /app/nuxt_IA && npm ci && npm run build

EXPOSE 3000

CMD export FRONTEND_URL="http://localhost:${PORT:-3000}" && \
    PORT=3001 node /app/nuxt_IA/.output/server/index.mjs & \
    exec node /app/prototype-front/.output/server/index.mjs
