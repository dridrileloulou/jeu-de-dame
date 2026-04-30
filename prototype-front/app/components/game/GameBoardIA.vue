<template>
  <div class="game-wrapper">

    <!-- Game Over Overlay -->
    <div v-if="winner" class="gameover-overlay">
      <div class="gameover-card">
        <div class="gameover-icon">{{ winner === 'white' ? '🏆' : '🤖' }}</div>
        <h2 class="gameover-title">{{ winner === 'white' ? 'Vous avez gagné !' : "L'IA a gagné !" }}</h2>
        <p class="gameover-reason">{{ winner === 'white' ? "L'IA n'a plus de pions" : "Vous n'avez plus de pions" }}</p>
        <div class="gameover-scores">
          <div class="gscore">
            <span class="gscore-pip pip--white"></span>
            <span class="gscore-label">Blanc</span>
            <span class="gscore-val">{{ whiteCaptured }}</span>
          </div>
          <span class="gscore-sep">·</span>
          <div class="gscore">
            <span class="gscore-pip pip--black"></span>
            <span class="gscore-label">Noir</span>
            <span class="gscore-val">{{ blackCaptured }}</span>
          </div>
        </div>
        <div class="gameover-btns">
          <button class="gameover-btn gameover-btn--secondary" @click="resetGame">Rejouer</button>
          <NuxtLink to="/" class="gameover-btn">← Accueil</NuxtLink>
        </div>
      </div>
    </div>

    <div class="timers-container" v-if="gameMode === 'local'">
      <PlayerTimer
        :time-remaining="blackTime"
        color="black"
        :is-active="currentPlayer === 'black'"
      />
      <PlayerTimer
        :time-remaining="whiteTime"
        color="white"
        :is-active="currentPlayer === 'white'"
      />
    </div>
    <div class="board-section">
      <div class="turn-banner" :class="currentPlayer">
        <span class="turn-dot-sm" :class="currentPlayer === 'white' ? 'dot-white' : 'dot-black'"></span>
        {{ currentPlayer === 'white' ? 'Votre tour (Blanc)' : "Tour de l'IA (Noir)" }}
      </div>
    <div class="board-container">
      <div class="board" :class="{ paused: isPaused }">
        <div class="pause-overlay" v-if="isPaused">
          <div class="pause-text">PAUSE</div>
        </div>
        <div v-for="(_, row) in 10" :key="row" class="row">
          <div
            v-for="(_, col) in 10"
            :key="col"
            class="cell"
            :class="{
              dark:        (row + col) % 2 === 0,
              light:       (row + col) % 2 !== 0,
              shadowed:    isValidMove(row, col),
              'last-from': lastMoveFrom && lastMoveFrom.x === col && lastMoveFrom.y === row,
              'last-to':   lastMoveTo   && lastMoveTo.x   === col && lastMoveTo.y   === row,
            }"
            @click="handleCellClick(row, col)"
          >
            <!-- Affichage des pions depuis le board -->
            <div
              v-if="getPieceAt(col, row)"
              class="piece"
              :class="{ 
                selected: isSelected(row, col),
                black: getPieceAt(col, row)?.color === 'black',
                white: getPieceAt(col, row)?.color === 'white',
                draught: getPieceAt(col, row)?.isDraught,
                mandatoryCapture: isMandatoryCapture(row, col)
              }"
              @click.stop="selectPiece(row, col)"
            />
          </div>
        </div>
      </div>
      <div class="right-panel" v-if="gameMode === 'local'">
        <PlayerTurn :current-player="currentPlayer" />
        <div class="captures-panel">
          <p class="cap-title">Prises</p>
          <div class="cap-row">
            <span class="cap-pip pip--white"></span>
            <span class="cap-name">Blanc</span>
            <div class="cap-dots">
              <span v-for="i in whiteCaptured" :key="i" class="cap-dot dot--black"></span>
            </div>
            <span class="cap-count">{{ whiteCaptured }}</span>
          </div>
          <div class="cap-row">
            <span class="cap-pip pip--black"></span>
            <span class="cap-name">Noir</span>
            <div class="cap-dots">
              <span v-for="i in blackCaptured" :key="i" class="cap-dot dot--white"></span>
            </div>
            <span class="cap-count">{{ blackCaptured }}</span>
          </div>
        </div>
        <button class="pause-btn" @click="togglePause">
          {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
        </button>
      </div>
    </div>
    </div><!-- board-section -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Game } from '../../engine/Game.js'
import PlayerTurn from './PlayerTurn.vue'
import PlayerTimer from './PlayerTimer.vue'

const props = defineProps({
  gameMode: { type: String, default: 'local' },
  level:    { type: String, default: 'normale' }
})

let game = null
const rev = ref(0)
const currentPlayer = ref('white')
const whiteTime = ref(600)
const blackTime = ref(600)
const isPaused = ref(false)
const winner = ref(null)
const whiteCaptured = ref(0)
const blackCaptured = ref(0)
const lastMoveFrom = ref(null)
const lastMoveTo   = ref(null)
let timerInterval = null

onMounted(() => {
  game = new Game()
  startTimer()
})

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

function startTimer() {
  timerInterval = setInterval(() => {
    if (isPaused.value || props.gameMode !== 'local') return
    if (currentPlayer.value === 'white' && whiteTime.value > 0) whiteTime.value--
    else if (currentPlayer.value === 'black' && blackTime.value > 0) blackTime.value--
  }, 1000)
}

function togglePause() { isPaused.value = !isPaused.value }

function getPieceAt(x, y)         { rev.value; return game?.getPiece(x, y) ?? null }
function isSelected(row, col)     { rev.value; return game?.isSelected(row, col) ?? false }
function isValidMove(row, col)    { rev.value; return game?.isValidMove(row, col) ?? false }
function isMandatoryCapture(r, c) { rev.value; return game?.isMandatory(r, c) ?? false }

function selectPiece(row, col) {
  if (!game) return
  game.selectPiece(row, col)
  rev.value++
}

function resetGame() {
  game = new Game()
  currentPlayer.value = 'white'
  whiteCaptured.value = 0
  blackCaptured.value = 0
  winner.value = null
  isPaused.value = false
  lastMoveFrom.value = null
  lastMoveTo.value   = null
  rev.value++
}

function handleCellClick(row, col) {
  if (isPaused.value || !game || winner.value) return
  if (game.isValidMove(row, col)) {
    const movingPlayer = currentPlayer.value
    const result = game.executeMove(row, col)
    if (result) {
      if (result.captured) {
        if (movingPlayer === 'white') whiteCaptured.value++
        else blackCaptured.value++
      }
      if (!result.continuation) {
        currentPlayer.value = result.nextPlayer
        lastMoveFrom.value  = result.from
        lastMoveTo.value    = result.to
        rev.value++
        const w = game.checkWinner()
        if (w) { winner.value = w; recordStat(w) }
      } else {
        rev.value++
      }
    }
  } else {
    selectPiece(row, col)
  }
}

async function recordStat(winnerColor) {
  try {
    await $fetch('/api/stats/record', {
      method: 'POST',
      body: { mode: 'ia', result: winnerColor === 'white' ? 'win' : 'loss' }
    })
  } catch {}
}
</script>

<style scoped>
/* --- Configuration Globale --- */
* {
  box-sizing: border-box;
}

.game-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 100vh;
  background-color: transparent;
  padding: 10px;
  overflow: hidden;
}

/* --- Conteneur Principal (#444 de ton accueil) --- */
.board-container {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background-color: #444444; 
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

/* --- LE PLATEAU (Structure Rows conservée) --- */
.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
  position: relative;
  background-color: #0a0a0a;
}

.board.paused {
  position: relative;
}

.board.paused::after {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.4);
  z-index: 5;
}

.row {
  display: flex; /* Aligne les 10 cases horizontalement */
}

.cell {
  /* On définit la taille en fonction de la hauteur de l'écran (vh) 
     8vh * 10 cases = 80% de la hauteur de l'écran. Ça rentrera toujours. */
  width: clamp(40px, 8vh, 80px);
  height: clamp(40px, 8vh, 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Case Sombre : Gris #262626 */
.dark {
  background-color: #262626;
}

/* Case Claire : Gris #b0b0b0 */
.light {
  background-color: #b0b0b0;
}

.cell.last-from { background-color: #3a2c00 !important; }
.cell.last-to   { background-color: #5e4500 !important; }

/* Indicateur de mouvement possible (Style Initial) */
.shadowed::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 45%;
  border-radius: 50%;
  background-color: rgba(2, 2, 2, 0.5);
  z-index: 1;
}

/* --- Pions : STYLE INITIAL COMPLET --- */
.piece {
  width: 80%; 
  height: 80%;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease;
}

.piece.black { background: radial-gradient(circle at 35% 35%, #555, #111); }
.piece.white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }

.piece.selected {
  box-shadow: 0 0 12px 4px gold, inset 0 -4px 6px rgba(0,0,0,0.3);
  transform: scale(1.1);
}

.piece.mandatoryCapture {
  box-shadow: 0 0 15px 6px #ff2200, inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
  animation: captureGlow 0.6s ease-in-out infinite;
}

@keyframes captureGlow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* --- Dames : STYLE INITIAL COMPLET --- */
.piece.draught {
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4), 0 0 0 4px rgba(255, 215, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.7);
}

.piece.draught::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 200, 0.8), transparent);
  border-radius: 50%;
  z-index: -1;
}

.piece.draught::after {
  content: '♛';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: clamp(1rem, 3vh, 2.2rem);
  color: rgba(255, 215, 0, 0.95);
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
}

/* --- UI Panel & Tour Dynamique --- */
.right-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 200px;
}

/* Style demandé pour l'indicateur de tour */
.turn-indicator {
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  transition: all 0.3s ease;
}

/* NOIR joue : Gris foncé #262626, Police blanche */
.turn-indicator.black {
  background-color: #262626;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* BLANC joue : Blanc, Police gris foncé #262626 */
.turn-indicator.white {
  background-color: #ffffff;
  color: #262626;
  border: 1px solid #ccc;
}

.pause-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ff2200;
  background: rgba(255, 34, 0, 0.2);
  color: #ff2200;
  font-weight: bold;
  cursor: pointer;
}

.pause-btn:hover {
  background: rgba(255, 34, 0, 0.4);
}

.pause-overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.3);
  z-index: 10; /* au-dessus du blur */
}

.pause-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ff2200;
  text-shadow: 0 0 20px #ff2200;
}

.timers-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ── Game Over ──────────────────────────────────────────────── */
.gameover-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}

.gameover-card {
  background: #444;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  color: white;
}

.gameover-icon {
  font-size: 3.5rem;
  line-height: 1;
}

.gameover-reason {
  margin: -0.5rem 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.gameover-btns {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.gameover-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gameover-scores {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
}

.gscore {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gscore-pip {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.3);
}

.gscore-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.gscore-val {
  font-size: 1.3rem;
  font-weight: 700;
}

.gscore-sep {
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.2rem;
}

.gameover-btn {
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.gameover-btn:hover { background: rgba(255, 255, 255, 0.25); }
.gameover-btn--secondary {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.6);
}
.gameover-btn--secondary:hover { background: rgba(255, 255, 255, 0.1); color: white; }

/* ── Board section wrapper ──────────────────────────────────── */
.board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* ── Turn banner ────────────────────────────────────────────── */
.turn-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  color: white;
}
.turn-banner.white {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: my-turn-glow 1.8s ease-in-out infinite;
}
.turn-banner.black {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}
@keyframes my-turn-glow {
  0%, 100% { box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.15); }
  50%       { box-shadow: 0 0 16px 4px rgba(255, 255, 255, 0.4); }
}

.turn-dot-sm {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.3);
}
.dot-white { background: #fff; }
.dot-black { background: #222; }

@media (max-width: 700px) {
  .right-panel { display: none; }
}

/* ── Captures Panel ─────────────────────────────────────────── */
.captures-panel {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cap-title {
  margin: 0 0 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4);
}

.cap-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cap-pip {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.cap-name {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  min-width: 2.8rem;
}

.cap-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
}

.cap-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.3);
}

.cap-count {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  min-width: 1.2rem;
  text-align: right;
}

.pip--white, .dot--white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }
.pip--black, .dot--black { background: radial-gradient(circle at 35% 35%, #555, #111); }
</style>