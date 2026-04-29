<template>
  <div class="game-wrapper">
    <div class="timers-container" v-if="timerSeconds > 0">
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
              dark: (row + col) % 2 === 0,
              light: (row + col) % 2 !== 0,
              shadowed: isValidMove(row, col)
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
        <button class="pause-btn" @click="togglePause">
          {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Game } from '../../engine/Game.js'
import PlayerTurn from '../PlayerTurn.vue'
import PlayerTimer from '../PlayerTimer.vue'

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

function handleCellClick(row, col) {
  if (isPaused.value || !game) return
  if (game.isValidMove(row, col)) {
    const result = game.executeMove(row, col)
    if (result) { currentPlayer.value = result.nextPlayer; rev.value++ }
  } else {
    selectPiece(row, col)
  }
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
</style>