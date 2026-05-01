<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GameBar from '../components/GameBar.vue'
import GameBoardOffline from '../components/game/GameBoardOffline.vue'

const route = useRoute()

const started      = ref(false)
const timerChoice  = ref('none')
const customMins   = ref(5)
const inputWhite   = ref('')
const inputBlack   = ref('')

const resumeState  = ref(null)
const resumeId     = ref(null)

const timerSeconds = computed(() => {
  if (resumeState.value)             return resumeState.value.timerSeconds ?? 0
  if (timerChoice.value === 'none')  return 0
  if (timerChoice.value === '5min')  return 300
  if (timerChoice.value === '10min') return 600
  return customMins.value * 60
})

const whiteName = computed(() => resumeState.value?.whiteName || inputWhite.value.trim() || 'Blanc')
const blackName = computed(() => resumeState.value?.blackName || inputBlack.value.trim() || 'Noir')

function launch() { started.value = true }

onMounted(async () => {
  const id = route.query.resume?.toString()
  if (!id) return
  try {
    const games = await $fetch('/api/local-games')
    const g = games.find(g => g._id === id)
    if (g) {
      resumeState.value = g
      resumeId.value    = g._id
      started.value     = true
    }
  } catch {}
})
</script>

<template>
  <div class="page">

    <!-- Bloquer sur mobile -->
    <div class="mobile-block">
      <p>👥 Le mode 2 joueurs sur le même écran n'est pas disponible sur mobile.</p>
      <NuxtLink to="/" class="btn-back">← Retour à l'accueil</NuxtLink>
    </div>

    <!-- Desktop uniquement -->
    <div class="desktop-only">
      <GameBar title="Joueur vs Joueur">
        <button v-if="started" class="bar-btn" @click="started = false">← Config</button>
      </GameBar>

      <!-- Modal de configuration -->
      <div v-if="!started" class="backdrop">
        <div class="modal">
          <NuxtLink to="/" class="modal-close">✕</NuxtLink>

          <h2 class="modal-title">👥 Jouer contre un ami</h2>
          <p class="modal-sub">Deux joueurs sur le même écran, en alternance.</p>

          <div class="field">
            <span class="field-label">Joueurs</span>
            <div class="players-row">
              <div class="player-input-wrap">
                <span class="player-dot dot-black"></span>
                <input v-model="inputBlack" type="text" maxlength="20" placeholder="Noir" class="player-input" />
              </div>
              <span class="players-vs">vs</span>
              <div class="player-input-wrap">
                <span class="player-dot dot-white"></span>
                <input v-model="inputWhite" type="text" maxlength="20" placeholder="Blanc" class="player-input" />
              </div>
            </div>
          </div>

          <div class="field">
            <span class="field-label">Temps par joueur</span>
            <div class="btn-group">
              <button
                v-for="opt in [{ v:'none',l:'♾ Sans' },{ v:'5min',l:'5 min' },{ v:'10min',l:'10 min' },{ v:'custom',l:'Perso' }]"
                :key="opt.v"
                :class="['pill', { active: timerChoice === opt.v }]"
                @click="timerChoice = opt.v"
              >{{ opt.l }}</button>
            </div>

            <div v-if="timerChoice === 'custom'" class="custom-row">
              <input v-model.number="customMins" type="number" min="1" max="60" class="num-input" />
              <span class="num-label">minutes</span>
            </div>
          </div>

          <button class="btn-launch" @click="launch">Lancer la partie →</button>
        </div>
      </div>

      <!-- Plateau -->
      <div v-if="started" class="board-wrap">
        <GameBoardOffline
          :timer-seconds="timerSeconds"
          :white-name="whiteName"
          :black-name="blackName"
          :saved-game-id="resumeId"
          :initial-state="resumeState"
        />
      </div>
    </div>
  </div>
</template>

<style>
body { overflow: hidden; }
</style>

<style scoped>
.page {
  min-height: 100vh;
  background: #abaaaa;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  color: white;
}

/* ── Mobile block ── */
.mobile-block {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
  gap: 1.5rem;
}

.mobile-block p {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.8);
  max-width: 300px;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 600;
}

.desktop-only {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

@media (max-width: 700px) {
  .mobile-block  { display: flex; }
  .desktop-only  { display: none; }
}

/* ── Backdrop ── */
.backdrop {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* ── Modal ── */
.modal {
  position: relative;
  background: #222;
  border-radius: 18px;
  padding: 2.4rem 2.8rem;
  width: min(460px, 92vw);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.08);
}

.modal-close {
  position: absolute;
  top: 1.1rem; right: 1.2rem;
  color: rgba(255,255,255,0.35);
  font-size: 1.1rem;
  text-decoration: none;
  line-height: 1;
  transition: color 0.2s;
}
.modal-close:hover { color: white; }

.modal-title { margin: 0; font-size: 1.35rem; font-weight: 700; }
.modal-sub { margin: -0.6rem 0 0; font-size: 0.88rem; color: rgba(255,255,255,0.45); }

.field { display: flex; flex-direction: column; gap: 0.65rem; }

.field-label {
  font-size: 0.78rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: rgba(255,255,255,0.45);
}

.btn-group { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.pill {
  flex: 1; min-width: 80px;
  padding: 0.5rem 0.7rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
  font-size: 0.88rem; cursor: pointer;
  transition: all 0.15s; white-space: nowrap; text-align: center;
}
.pill:hover { background: rgba(255,255,255,0.13); color: white; }
.pill.active { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.55); color: white; font-weight: 600; }

.custom-row { display: flex; align-items: center; gap: 0.6rem; }

.num-input {
  width: 72px; padding: 0.42rem 0.65rem;
  border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08); color: white;
  font-size: 0.95rem; outline: none;
}
.num-label { font-size: 0.9rem; color: rgba(255,255,255,0.5); }

.players-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.player-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 0.4rem 0.7rem;
  transition: border-color 0.2s;
}
.player-input-wrap:focus-within { border-color: rgba(255,255,255,0.45); }

.player-dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-white { background: #e8e8e8; border: 1px solid rgba(0,0,0,0.25); }
.dot-black { background: #222; border: 1px solid rgba(255,255,255,0.3); }

.player-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 0.92rem;
  font-family: inherit;
  min-width: 0;
}
.player-input::placeholder { color: rgba(255,255,255,0.3); }

.players-vs {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.btn-launch {
  margin-top: 0.4rem; padding: 0.78rem 1.4rem;
  border-radius: 12px; border: none;
  background: #b0b0b0; color: #111;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-launch:hover { background: #c8c8c8; transform: scale(1.02); }

.board-wrap {
  flex: 1; display: flex;
  align-items: center; justify-content: center;
  min-height: 0; overflow: hidden;
}

.bar-btn {
  background: none; border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.7); padding: 4px 10px;
  border-radius: 6px; font-size: 0.8rem; cursor: pointer;
}
.bar-btn:hover { color: white; border-color: rgba(255,255,255,0.5); }
</style>
