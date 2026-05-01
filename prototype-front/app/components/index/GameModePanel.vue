<script setup>
defineProps({
  loggedIn: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['start-ia', 'open-auth', 'open-saved-games', 'open-shop'])
</script>

<template>
  <div class="center-block">
    <h1 v-if="loggedIn" class="greeting">Bonjour {{ user?.name }} !</h1>

    <div class="main-panel">
      <h2>Choisissez votre mode de jeu :</h2>

      <div class="buttons">
        <NuxtLink v-if="loggedIn" to="/jeu-online" class="btn-mode">
          <span class="btn-icon">🌐</span>
          Jouer en ligne
        </NuxtLink>
        <button class="btn-mode" @click="emit('start-ia')">
          <span class="btn-icon">🤖</span>
          Jouer contre une IA
        </button>

        <p v-if="!loggedIn" class="connect-hint" @click="emit('open-auth')">
          🔒 Connectez-vous pour jouer en ligne
        </p>

        <NuxtLink to="/jeu-offline" class="btn-mode btn-offline">
          <span class="btn-icon">👥</span>
          Jouer contre un ami
        </NuxtLink>
      </div>

      <!-- BOUTONS CARRÉS SOMBRES -->
      <div v-if="loggedIn" class="square-buttons">
        <button class="btn-square" @click="emit('open-saved-games')">
          <span class="square-icon">💾</span>
          <span class="square-label">Mes parties</span>
        </button>
        <button class="btn-square" @click="emit('open-shop')">
          <span class="square-icon">🛒</span>
          <span class="square-label">Boutique</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── CENTRE ── */
.center-block {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: calc(var(--cell) * 0.22);
  padding-bottom: calc(var(--cell) * 1.2);
}

/* ── GREETING ── */
.greeting {
  text-align: center;
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}

/* ── PANNEAU PRINCIPAL ── */
.main-panel {
  width: var(--panel-w);
  padding: calc(var(--cell) * 0.8) calc(var(--cell) * 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
  text-align: center;
  min-height: calc(var(--cell) * 5);
}

.main-panel h2 {
  margin: 0;
  font-size: var(--fs-lg);
}

.buttons {
  margin-top: calc(var(--cell) * 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  width: 100%;
  flex: 1;
}

/* ── BOUTONS MODE ── */
.btn-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--cell) * 0.15);
  padding: calc(var(--cell) * 0.15) calc(var(--cell) * 0.25);
  background: #b0b0b0;
  color: black;
  text-decoration: none;
  border-radius: var(--radius);
  font-size: var(--fs-lg);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  font-weight: 500;
}

.btn-mode:hover {
  background: #c8c8c8;
  transform: scale(1.04);
}

.btn-icon {
  font-size: calc(var(--fs-lg) * 1.15);
}

/* ── CONNECT HINT ── */
.connect-hint {
  margin: 0;
  padding: calc(var(--cell) * 0.14) calc(var(--cell) * 0.21);
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: var(--radius);
  font-size: var(--fs-base);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.connect-hint:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

/* ── BOUTONS CARRÉS SOMBRES ── */
.square-buttons {
  display: flex;
  gap: var(--gap);
  width: 100%;
  justify-content: center;
  max-width: 100%;
  align-items: center;
  margin-top: var(--gap);
}

.btn-square {
  flex: 0 0 45%;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--cell) * 0.1);
  background: rgba(30, 30, 30, 0.9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  max-width: 160px;
}

.btn-square:hover {
  background: rgba(50, 50, 50, 0.95);
  transform: scale(1.04);
}

.square-icon {
  font-size: calc(var(--fs-xl) * 0.7);
  line-height: 1;
}

.square-label {
  font-size: var(--fs-base);
  font-weight: 500;
}

@media (max-width: 700px) {
  .btn-offline { display: none; }
}
</style>
