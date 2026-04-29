<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Game } from '../../engine/Game.js'

const props = defineProps({
  code:     { type: String, required: true },
  userId:   { type: String, required: true },
  userName: { type: String, default: 'Joueur' }
})

// ── État WebSocket ────────────────────────────────────────────────────────
let ws = null
const status = ref('connecting') // connecting | waiting | playing | finished | error

// ── État jeu ──────────────────────────────────────────────────────────────
const myColor       = ref(null)          // 'white' | 'black'
const winner        = ref(null)
const endReason     = ref(null)
const currentPlayer = ref('white')
const rev           = ref(0)            // déclencheur de re-render
const whiteCaptured = ref(0)
const blackCaptured = ref(0)
let game = null

// ── Timers ────────────────────────────────────────────────────────────────
const timerSecs  = ref(0)
const whiteTime  = ref(0)
const blackTime  = ref(0)
let timerInterval = null

// ── Computed ──────────────────────────────────────────────────────────────
const isMyTurn   = computed(() => status.value === 'playing' && currentPlayer.value === myColor.value)
const isFlipped  = computed(() => myColor.value === 'black')

// Ordre d'affichage des lignes/colonnes (retourné pour le joueur noir)
const rows = computed(() => isFlipped.value ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9])
const cols = computed(() => isFlipped.value ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9])

const myLabel      = computed(() => myColor.value === 'white' ? 'Blanc' : 'Noir')
const oppLabel     = computed(() => myColor.value === 'white' ? 'Noir'  : 'Blanc')
const myTimeSecs   = computed(() => myColor.value === 'white' ? whiteTime.value : blackTime.value)
const oppTimeSecs  = computed(() => myColor.value === 'white' ? blackTime.value : whiteTime.value)
const turnLabel    = computed(() => isMyTurn.value ? 'Votre tour' : "Tour de l'adversaire")
const winnerLabel  = computed(() => {
  if (!winner.value) return ''
  return winner.value === myColor.value ? 'Vous avez gagné !' : 'Vous avez perdu.'
})

function fmt(s) {
  if (s <= 0) return '0:00'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

async function copyCode() {
  await navigator.clipboard.writeText(props.code)
  codeCopied.value = true
  setTimeout(() => codeCopied.value = false, 2000)
}
const codeCopied = ref(false)

// ── WebSocket ─────────────────────────────────────────────────────────────
function connect() {
  if (!props.userId) { status.value = 'error'; return }
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  ws = new WebSocket(`${proto}://${location.host}/ws/game`)

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'init', code: props.code, userId: props.userId }))
  }

  ws.onmessage = ({ data: raw }) => {
    let d; try { d = JSON.parse(raw) } catch { return }

    if (d.type === 'waiting') {
      status.value = 'waiting'
    }

    if (d.type === 'start') {
      myColor.value   = d.color
      timerSecs.value = d.timerSeconds
      whiteTime.value = d.timerSeconds
      blackTime.value = d.timerSeconds
      game            = new Game()
      currentPlayer.value = 'white'
      whiteCaptured.value = 0
      blackCaptured.value = 0
      rev.value++
      status.value    = 'playing'
      if (d.timerSeconds > 0) startTimer()
    }

    if (d.type === 'move') applyMove(d)

    if (d.type === 'end') {
      winner.value    = d.winner
      endReason.value = d.reason
      status.value    = 'finished'
      stopTimer()
    }

    if (d.type === 'opponent_disconnected') {
      winner.value    = myColor.value
      endReason.value = 'disconnect'
      status.value    = 'finished'
      stopTimer()
    }

    if (d.type === 'error') status.value = 'error'
  }

  ws.onclose = () => { if (status.value === 'playing') status.value = 'error' }
}

// ── Timer ─────────────────────────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    if (status.value !== 'playing') return
    if (currentPlayer.value === 'white') {
      if (whiteTime.value > 0) whiteTime.value--
      if (whiteTime.value === 0) sendMsg({ type: 'time_up', code: props.code })
    } else {
      if (blackTime.value > 0) blackTime.value--
      if (blackTime.value === 0) sendMsg({ type: 'time_up', code: props.code })
    }
  }, 1000)
}
function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null } }

function sendMsg(obj) { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)) }

// ── Logique plateau ───────────────────────────────────────────────────────

function getPiece(x, y)          { rev.value; return game?.getPiece(x, y) ?? null }
function isSelected(row, col)    { rev.value; return game?.isSelected(row, col) ?? false }
function isMandatory(row, col)   { rev.value; return game?.isMandatory(row, col) ?? false }
function isValidTarget(row, col) { rev.value; return game?.isValidMove(row, col) ?? false }

function selectPiece(row, col) {
  if (!isMyTurn.value || !game) return
  game.selectPiece(row, col, myColor.value)
  rev.value++
}

function onCellClick(row, col) {
  if (!isMyTurn.value || !game) return
  if (game.isValidMove(row, col)) move(row, col)
  else selectPiece(row, col)
}

function move(toRow, toCol) {
  if (!isMyTurn.value || !game) return
  const result = game.executeMove(toRow, toCol)
  if (!result) return

  if (result.captured) {
    if (myColor.value === 'white') whiteCaptured.value++
    else blackCaptured.value++
  }

  sendMsg({ type: 'move', code: props.code, from: result.from, to: result.to, captured: result.captured, continuation: result.continuation, nextPlayer: result.nextPlayer })

  if (!result.continuation) currentPlayer.value = result.nextPlayer
  rev.value++
}

// Appliquer le coup reçu de l'adversaire
function applyMove(d) {
  if (!game) return
  game.applyMove(d.from, d.to, d.captured, d.continuation, d.nextPlayer)
  if (d.captured) {
    if (myColor.value === 'white') blackCaptured.value++
    else whiteCaptured.value++
  }
  if (!d.continuation) currentPlayer.value = d.nextPlayer
  rev.value++
}

onMounted(connect)
onUnmounted(() => { stopTimer(); if (ws) { ws.close(); ws = null } })
</script>

<template>
  <!-- ── CONNEXION ── -->
  <div v-if="status === 'connecting'" class="overlay">
    <p class="wait-text">Connexion en cours…</p>
  </div>

  <!-- ── ERREUR ── -->
  <div v-else-if="status === 'error'" class="overlay">
    <p class="wait-text error-text">Erreur de connexion. Rechargez la page.</p>
    <button class="btn-action" @click="$router.push('/jeu-online')">← Retour</button>
  </div>

  <!-- ── ATTENTE ── -->
  <div v-else-if="status === 'waiting'" class="overlay">
    <div class="waiting-card">
      <div class="spinner"></div>
      <p class="wait-title">En attente d'un adversaire…</p>
      <p class="wait-sub">Partagez ce code :</p>
      <div class="code-display">
        <span class="code-val">{{ code }}</span>
        <button class="btn-copy" @click="copyCode">
          {{ codeCopied ? '✓ Copié !' : '📋 Copier' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ── FIN DE PARTIE ── -->
  <div v-else-if="status === 'finished'" class="overlay">
    <div class="end-card">
      <div class="end-icon">{{ winner === myColor ? '🏆' : endReason === 'disconnect' ? '🔌' : '😔' }}</div>
      <h2 class="end-title">{{ winnerLabel }}</h2>
      <p class="end-sub">
        <template v-if="endReason === 'time'">Temps écoulé</template>
        <template v-else-if="endReason === 'resign'">L'adversaire a abandonné</template>
        <template v-else-if="endReason === 'disconnect'">L'adversaire s'est déconnecté</template>
      </p>
      <div class="end-scores" v-if="whiteCaptured + blackCaptured > 0">
        <div class="end-score-item">
          <span class="end-score-pip pip--white"></span>
          <span>Blanc : {{ whiteCaptured }}</span>
        </div>
        <span class="end-score-sep">·</span>
        <div class="end-score-item">
          <span class="end-score-pip pip--black"></span>
          <span>Noir : {{ blackCaptured }}</span>
        </div>
      </div>
      <button class="btn-action" @click="$router.push('/jeu-online')">Nouvelle partie</button>
    </div>
  </div>

  <!-- ── PARTIE EN COURS ── -->
  <div v-else-if="status === 'playing'" class="game-wrapper">

    <!-- Panneau adversaire (en haut) -->
    <div class="side-panel top-panel">
      <div class="player-info">
        <div class="player-dot" :class="oppLabel === 'Blanc' ? 'dot-white' : 'dot-black'"></div>
        <span class="player-name">Adversaire ({{ oppLabel }})</span>
        <div class="inline-caps">
          <span
            v-for="i in (myColor === 'white' ? blackCaptured : whiteCaptured)"
            :key="i"
            class="inline-pip"
            :class="myColor === 'white' ? 'pip--white' : 'pip--black'"
          ></span>
          <span class="inline-cap-count" v-if="(myColor === 'white' ? blackCaptured : whiteCaptured) > 0">
            ×{{ myColor === 'white' ? blackCaptured : whiteCaptured }}
          </span>
        </div>
      </div>
      <div v-if="timerSecs > 0" class="timer" :class="{ 'timer-low': oppTimeSecs <= 30, 'timer-active': currentPlayer !== myColor }">
        {{ fmt(oppTimeSecs) }}
      </div>
    </div>

    <!-- Plateau -->
    <div class="board-container">
      <div class="board">
        <div v-for="row in rows" :key="row" class="row">
          <div
            v-for="col in cols"
            :key="col"
            class="cell"
            :class="{
              dark:     (row + col) % 2 === 0,
              light:    (row + col) % 2 !== 0,
              shadowed: isValidTarget(row, col)
            }"
            @click="onCellClick(row, col)"
          >
            <div
              v-if="getPiece(col, row)"
              class="piece"
              :class="{
                selected:        isSelected(row, col),
                black:           getPiece(col, row)?.color === 'black',
                white:           getPiece(col, row)?.color === 'white',
                draught:         getPiece(col, row)?.isDraught,
                mandatoryCapture:isMandatory(row, col),
                locked:          !isMyTurn || getPiece(col, row)?.color !== myColor
              }"
              @click.stop="selectPiece(row, col)"
            />
          </div>
        </div>
      </div>

      <!-- Panel droit : tour + abandon -->
      <div class="right-panel">
        <div class="turn-indicator" :class="currentPlayer">
          <div class="turn-dot" :class="currentPlayer === 'white' ? 'dot-white' : 'dot-black'"></div>
          {{ turnLabel }}
        </div>
        <button class="btn-resign" @click="sendMsg({ type: 'resign', code: props.code })">
          🏳 Abandonner
        </button>
      </div>
    </div>

    <!-- Panneau moi (en bas) -->
    <div class="side-panel bottom-panel">
      <div class="player-info">
        <div class="player-dot" :class="myLabel === 'Blanc' ? 'dot-white' : 'dot-black'"></div>
        <span class="player-name">Moi ({{ myLabel }})</span>
        <div class="inline-caps">
          <span
            v-for="i in (myColor === 'white' ? whiteCaptured : blackCaptured)"
            :key="i"
            class="inline-pip"
            :class="myColor === 'white' ? 'pip--black' : 'pip--white'"
          ></span>
          <span class="inline-cap-count" v-if="(myColor === 'white' ? whiteCaptured : blackCaptured) > 0">
            ×{{ myColor === 'white' ? whiteCaptured : blackCaptured }}
          </span>
        </div>
      </div>
      <div v-if="timerSecs > 0" class="timer" :class="{ 'timer-low': myTimeSecs <= 30, 'timer-active': currentPlayer === myColor }">
        {{ fmt(myTimeSecs) }}
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Overlay (attente / erreur / fin) ─────────────────────────────────── */
.overlay {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  gap: 1.5rem;
}

.wait-text  { font-size: 1.2rem; color: white; }
.error-text { color: #ff6b6b; }

.waiting-card, .end-card {
  background: #444;
  border-radius: 16px;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  color: white;
}

.wait-title { font-size: 1.3rem; font-weight: 600; margin: 0; }
.wait-sub   { font-size: 0.9rem; color: rgba(255,255,255,0.5); margin: 0; }

.code-display {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255,255,255,0.08);
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
}

.code-val {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.25em;
}

.btn-copy {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.btn-copy:hover { background: rgba(255,255,255,0.28); }

/* Spinner */
.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Fin de partie */
.end-icon  { font-size: 3rem; }
.end-title { margin: 0; font-size: 1.5rem; }
.end-sub   { margin: 0; color: rgba(255,255,255,0.5); }

.btn-action {
  margin-top: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-action:hover { background: rgba(255,255,255,0.28); }

/* ── Plateau ─────────────────────────────────────────────────────────── */
.game-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem;
}

.side-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding: 0.5rem 1rem;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  gap: 1rem;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: white;
  font-weight: 600;
}

.player-dot {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
}
.dot-white { background: #ffffff; }
.dot-black { background: #222222; }

.player-name { font-size: 0.95rem; }

.timer {
  font-size: 1.4rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}
.timer.timer-active { color: white; }
.timer.timer-low    { color: #ff6b6b !important; animation: pulse 0.8s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.board-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #444;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}

.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
  background: #0a0a0a;
}

.row { display: flex; }

.cell {
  width: clamp(30px, min(8.5vh, 9vw), 78px);
  height: clamp(30px, min(8.5vh, 9vw), 78px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dark  { background: #262626; }
.light { background: #b0b0b0; }

.shadowed::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 45%; height: 45%;
  border-radius: 50%;
  background: rgba(2,2,2,0.5);
  z-index: 1;
}

.piece {
  width: 80%; height: 80%;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
  position: relative;
  z-index: 2;
  transition: transform 0.15s;
}

.piece.black  { background: radial-gradient(circle at 35% 35%, #8a8a8a, #2e2e2e); border: 3px solid rgba(255,255,255,0.2); }
.piece.white  { background: radial-gradient(circle at 35% 35%, #ffffff, #cccccc); border: 3px solid rgba(0,0,0,0.15); }
.piece.locked { cursor: default; }

.piece.selected {
  box-shadow: 0 0 12px 4px gold, inset 0 -4px 6px rgba(0,0,0,0.3);
  transform: scale(1.1);
}

.piece.mandatoryCapture {
  box-shadow: 0 0 15px 6px #ff2200, inset 0 -4px 6px rgba(0,0,0,0.3);
  animation: glow 0.6s ease-in-out infinite;
}
@keyframes glow { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

.piece.draught {
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4),
              0 0 0 4px rgba(255,215,0,0.9), 0 0 15px rgba(255,215,0,0.6);
  border: 2px solid rgba(255,215,0,0.7);
}
.piece.draught::after {
  content: '♛';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  font-size: clamp(1rem, 3vh, 2rem);
  color: rgba(255,215,0,0.95);
  text-shadow: 0 0 6px rgba(0,0,0,0.7);
}

/* ── Panel droit ──────────────────────────────────────────────────────── */
.right-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  min-width: 170px;
}

.turn-indicator {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}
.turn-indicator.white { background: #fff;     color: #262626; }
.turn-indicator.black { background: #262626;  color: #fff;   border: 1px solid rgba(255,255,255,0.2); }

.turn-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.3); }

.btn-resign {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(255,34,0,0.5);
  background: rgba(255,34,0,0.15);
  color: #ff6b6b;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-resign:hover { background: rgba(255,34,0,0.35); }

/* ── Captures inline (side panels) ───────────────────────────── */
.inline-caps {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  margin-left: 0.4rem;
}

.inline-pip {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 -1px 3px rgba(0, 0, 0, 0.3);
}

.inline-cap-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
}

/* ── End-card scores ─────────────────────────────────────────── */
.end-scores {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
}

.end-score-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.end-score-pip {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.3);
}

.end-score-sep {
  color: rgba(255, 255, 255, 0.25);
}

/* Shared piece colors (also used in end-card + inline) */
.pip--white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }
.pip--black { background: radial-gradient(circle at 35% 35%, #555, #111); }

@media (max-width: 700px) {
  .game-wrapper {
    padding: 0.4rem;
    gap: 0.4rem;
  }

  .side-panel {
    padding: 0.4rem 0.6rem;
    gap: 0.5rem;
  }

  .player-name { font-size: 0.8rem; }
  .timer { font-size: 1rem; }

  .board-container {
    flex-direction: column;
    padding: 8px;
    gap: 8px;
  }

  .right-panel {
    flex-direction: row;
    min-width: unset;
    width: 100%;
    gap: 0.6rem;
  }

  .turn-indicator {
    flex: 1;
    padding: 0.6rem 0.5rem;
    font-size: 0.8rem;
  }

  .btn-resign {
    width: auto;
    white-space: nowrap;
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }

  .waiting-card, .end-card {
    padding: 1.8rem 1.5rem;
    width: 90vw;
    box-sizing: border-box;
  }

  .code-val { font-size: 1.5rem; }
}
</style>
