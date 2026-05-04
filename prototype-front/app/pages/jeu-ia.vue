<template>
  <div class="game">
    <div class="game-content">
      <NavMenu />
      <GameBoardIA v-if="ready" :level="level" :saved-game-id="resumeId" :initial-state="resumeState" :on-ai-move="onAiMove" :on-player-move="onPlayerMove" />
      <ChatIA ref="chatRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavMenu from '../components/NavMenu.vue'
import GameBoardIA from '../components/game/GameBoardIA.vue'
import ChatIA from '../components/game/ChatIA.vue'

const route = useRoute()
const level = computed(() => route.query.level || 'normale')

const resumeId    = ref(null)
const resumeState = ref(null)
const ready       = ref(false)
const chatRef     = ref(null)

function onAiMove(info) {
  chatRef.value?.showAiMove(info)
}

async function onPlayerMove(info) {
  try {
    const data = await $fetch('/api/coach-move', { method: 'POST', body: info })
    if (data.analysis) await chatRef.value?.showCoachAnalysis(data.analysis)
  } catch {}
}

// Plateau de démonstration : fin de partie imminente (3 blancs vs 2 noirs)
// Utilisé via ?demo=1 pour tester le debriefing Gemini rapidement
function buildDemoBoard() {
  const b = Array.from({ length: 10 }, () => Array(10).fill(null))
  // Noirs (IA) : 2 pions en haut
  b[1][3] = { color: 'black', isDraught: false }
  b[1][7] = { color: 'black', isDraught: false }
  // Blancs (joueur) : 3 pions en bas, dominant la partie
  b[6][2] = { color: 'white', isDraught: false }
  b[6][6] = { color: 'white', isDraught: false }
  b[8][4] = { color: 'white', isDraught: false }
  return b
}

onMounted(async () => {
  if (route.query.demo === '1') {
    resumeState.value = {
      board: buildDemoBoard(),
      currentPlayer: 'white',
      whiteCaptured: 8,
      blackCaptured: 2,
    }
    ready.value = true
    return
  }

  const id = route.query.resume?.toString()
  if (!id) { ready.value = true; return }
  try {
    const games = await $fetch('/api/local-games')
    const g = games.find(g => g._id === id)
    if (g) {
      resumeState.value = g
      resumeId.value    = g._id
    }
  } catch {}
  ready.value = true
})
</script>

<style>
/* Desktop : pas de scroll, tout tient dans l'écran */
body {
  overflow: hidden;
}

/* Mobile : on autorise le scroll vertical */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
    overflow-y: auto;
  }
}
</style>

<style scoped>
.game {
  min-height: 100vh;
  background: #abaaaa;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: white;
  font-family: Arial, sans-serif;
}

.game-content {
  display: flex;
  flex-direction: row;
  align-items: center;       /* chat aligné verticalement avec le plateau */
  justify-content: center;   /* ensemble centré horizontalement */
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  padding-left: 100px;       /* dégager le hamburger NavMenu */
  padding-right: 24px;
}

/* Tablette */
@media (max-width: 1024px) and (min-width: 769px) {
  .game-content {
    padding-left: 70px;
    padding-right: 12px;
    gap: 16px;
  }
}

/* Mobile : layout vertical, chat sous le plateau */
@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 4rem 12px 24px;
    gap: 16px;
  }
}
</style>