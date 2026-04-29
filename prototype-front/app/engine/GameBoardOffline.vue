<template>
  <!-- Game Over -->
  <div v-if="winner" class="gameover-overlay">
    <div class="gameover-card">
      <div class="gameover-crown">♛</div>
      <h2 class="gameover-title">{{ winner === 'white' ? 'Blanc' : 'Noir' }} a gagné !</h2>
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
      <button class="gameover-btn" @click="resetGame">Rejouer</button>
    </div>
  </div>

  <!-- Layout chess.com -->
  <div class="game-layout">

    <!-- Strip joueur NOIR (haut) -->
    <div class="player-strip" :class="{ 'strip-active': currentPlayer === 'black' }">
      <div class="strip-left">
        <div class="strip-dot dot-black"></div>
        <span class="strip-name">Noir</span>
        <div class="strip-caps" v-if="blackCaptured > 0">
          <span class="strip-cap-count">+{{ blackCaptured }}</span>
          <span v-for="i in Math.min(blackCaptured, 10)" :key="i" class="strip-pip pip--white"></span>
        </div>
      </div>
      <PlayerTimer v-if="timerSeconds > 0" :time-remaining="blackTime" color="black" :is-active="currentPlayer === 'black'" />
    </div>

    <!-- Plateau -->
    <div class="board-area">
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
              dark: (row + col) % 2 === 0,
              light: (row + col) % 2 !== 0,
              shadowed: isValidMove(row, col)
            }"
            @click="handleCellClick(row, col)"
          >
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
    </div>

    <!-- Strip joueur BLANC (bas) -->
    <div class="player-strip" :class="{ 'strip-active': currentPlayer === 'white' }">
      <div class="strip-left">
        <div class="strip-dot dot-white"></div>
        <span class="strip-name">Blanc</span>
        <div class="strip-caps" v-if="whiteCaptured > 0">
          <span class="strip-cap-count">+{{ whiteCaptured }}</span>
          <span v-for="i in Math.min(whiteCaptured, 10)" :key="i" class="strip-pip pip--black"></span>
        </div>
      </div>
      <PlayerTimer v-if="timerSeconds > 0" :time-remaining="whiteTime" color="white" :is-active="currentPlayer === 'white'" />
    </div>

    <!-- Barre de contrôles -->
    <div class="controls-bar">
      <div class="turn-badge" :class="currentPlayer">
        {{ currentPlayer === 'white' ? '⬜ Tour : Blanc' : '⬛ Tour : Noir' }}
      </div>
      <button class="pause-btn" @click="togglePause">
        {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Game } from './Game.js'
import PlayerTimer from './PlayerTimer.vue'

const props = defineProps({
  gameMode:     { type: String, default: 'local' },
  timerSeconds: { type: Number, default: 0 }
})

let game = null
const rev = ref(0)
const currentPlayer = ref('white')
const whiteTime = ref(props.timerSeconds)
const blackTime = ref(props.timerSeconds)
const isPaused = ref(false)
const winner = ref(null)
const whiteCaptured = ref(0)
const blackCaptured = ref(0)
let timerInterval = null

onMounted(() => {
  game = new Game()
  startTimer()
})

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

function startTimer() {
  if (props.timerSeconds === 0) return
  timerInterval = setInterval(() => {
    if (isPaused.value) return
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
  whiteTime.value = props.timerSeconds
  blackTime.value = props.timerSeconds
  whiteCaptured.value = 0
  blackCaptured.value = 0
  winner.value = null
  isPaused.value = false
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
        rev.value++
        const w = game.checkWinner()
        if (w) winner.value = w
      } else {
        rev.value++
      }
    }
  } else {
    selectPiece(row, col)
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ── Layout principal ─────────────────────────────────────────── */
.game-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 8px;
  gap: 6px;
}

/* ── Strips joueur ────────────────────────────────────────────── */
.player-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding: 8px 14px;
  background: rgba(0,0,0,0.25);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
}

.player-strip.strip-active {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
}

.strip-left {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.strip-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  flex-shrink: 0;
}
.dot-white { background: #e8e8e8; }
.dot-black { background: #2a2a2a; border-color: rgba(255,255,255,0.5); }

.strip-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
}

.strip-caps {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.strip-cap-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.strip-pip {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
}

/* ── Zone plateau ─────────────────────────────────────────────── */
.board-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  padding: 4px;
}

.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
  position: relative;
  background: #0a0a0a;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.board.paused::after {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0,0,0,0.4);
  z-index: 5;
}

.row { display: flex; }

.cell {
  /* gamebar(46) + strips(88) + controls(40) + padding/gaps/border(76) = 250px */
  width: clamp(30px, min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10)), 78px);
  height: clamp(30px, min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10)), 78px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dark  { background-color: #262626; }
.light { background-color: #b0b0b0; }

.shadowed::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 42%; height: 42%;
  border-radius: 50%;
  background: rgba(10,10,10,0.55);
  z-index: 1;
}

/* ── Pions ────────────────────────────────────────────────────── */
.piece {
  width: 82%;
  height: 82%;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.25);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 3px 6px rgba(0,0,0,0.5);
  position: relative;
  z-index: 2;
  transition: transform 0.15s ease;
  cursor: pointer;
}

.piece.black {
  background: radial-gradient(circle at 35% 35%, #8a8a8a, #2e2e2e);
  border: 3px solid rgba(255,255,255,0.2);
}
.piece.white {
  background: radial-gradient(circle at 35% 35%, #ffffff, #cccccc);
  border: 3px solid rgba(0,0,0,0.15);
}

.piece.selected {
  box-shadow: 0 0 0 3px gold, 0 0 14px 4px rgba(255,215,0,0.6), inset 0 -4px 6px rgba(0,0,0,0.3);
  transform: scale(1.12);
}

.piece.mandatoryCapture {
  box-shadow: 0 0 0 3px #ff2200, 0 0 14px 4px rgba(255,34,0,0.5), inset 0 -4px 6px rgba(0,0,0,0.3);
  animation: captureGlow 0.6s ease-in-out infinite;
}

@keyframes captureGlow {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.piece.draught {
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4),
              0 0 0 3px rgba(255,215,0,0.9), 0 0 12px rgba(255,215,0,0.5);
  border: 2px solid rgba(255,215,0,0.7);
}
.piece.draught::after {
  content: '♛';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  font-size: clamp(0.8rem, 2.5vmin, 2rem);
  color: rgba(255,215,0,0.95);
  text-shadow: 0 0 6px rgba(0,0,0,0.7);
}

/* ── Pause overlay ────────────────────────────────────────────── */
.pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  z-index: 10;
}
.pause-text {
  font-size: clamp(1.5rem, 6vw, 3rem);
  font-weight: bold;
  color: #ff2200;
  text-shadow: 0 0 20px #ff2200;
}

/* ── Barre de contrôles ───────────────────────────────────────── */
.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding: 6px 10px;
  gap: 0.8rem;
}

.turn-badge {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.25s;
}
.turn-badge.white { background: #d8d8d8; color: #262626; }
.turn-badge.black { background: #262626; color: #d8d8d8; border: 1px solid rgba(255,255,255,0.15); }

.pause-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,34,0,0.5);
  background: rgba(255,34,0,0.15);
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.pause-btn:hover { background: rgba(255,34,0,0.3); }

/* ── Game Over ────────────────────────────────────────────────── */
.gameover-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
}

.gameover-card {
  background: #444;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 12px 48px rgba(0,0,0,0.7);
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  color: white;
  width: min(90vw, 380px);
}

.gameover-crown {
  font-size: 3.5rem;
  color: rgba(255,215,0,0.95);
  text-shadow: 0 0 20px rgba(255,215,0,0.6);
  line-height: 1;
}

.gameover-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

.gameover-scores {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255,255,255,0.07);
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
}

.gscore { display: flex; align-items: center; gap: 0.5rem; }

.gscore-pip {
  display: inline-block;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.3);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3);
}

.gscore-label { font-size: 0.9rem; color: rgba(255,255,255,0.6); }
.gscore-val   { font-size: 1.3rem; font-weight: 700; }
.gscore-sep   { color: rgba(255,255,255,0.3); font-size: 1.2rem; }

.gameover-btn {
  margin-top: 0.4rem;
  padding: 0.75rem 2rem;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.35);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.gameover-btn:hover { background: rgba(255,255,255,0.25); }

/* Shared piece colors */
.pip--white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }
.pip--black { background: radial-gradient(circle at 35% 35%, #888, #333); }
</style>
