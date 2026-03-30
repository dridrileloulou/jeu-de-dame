<template>
  <div class="game-wrapper">
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Board } from '../engine/Board.js'
import { Movement } from '../engine/Movement.js'
import PlayerTurn from './PlayerTurn.vue'
import PlayerTimer from './PlayerTimer.vue'

const board = ref(null)
const selected = ref(null)
const validMoves = ref([])
const boardUpdate = ref(0)  // Forcer le re-render
const currentPlayer = ref('white')  // Blanc commence
const whiteTime = ref(600)  // 10 minutes en secondes
const blackTime = ref(600)  // 10 minutes en secondes
const isPaused = ref(false)
const mandatoryCapturePositions = ref([])  // Pions qui doivent capturer
let timerInterval = null

const props = defineProps({
  gameMode: {
    type: String,
    default: 'local'
  }
})

// Écouter les changements de joueur pour mettre à jour les positions de capture obligatoire
watch(() => currentPlayer.value, () => {
  updateMandatoryCapturePositions()
})

function updateMandatoryCapturePositions() {
  if (!board.value) return
  
  const legalMoves = Movement.getLegalMovesForPlayer(board.value, currentPlayer.value)
  const capturePositions = new Set()
  const hasAnyCapture = legalMoves.some(m => m.type === 'capture')
  
  if (hasAnyCapture) {
    legalMoves.forEach(m => {
      if (m.type === 'capture') {
        capturePositions.add(`${m.from.x}_${m.from.y}`)
      }
    })
  }
  mandatoryCapturePositions.value = Array.from(capturePositions)
}

onMounted(() => {
  board.value = new Board()
  updateMandatoryCapturePositions()
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function startTimer() {
  timerInterval = setInterval(() => {
    if (isPaused.value || props.gameMode !== 'local') return
    
    if (currentPlayer.value === 'white' && whiteTime.value > 0) {
      whiteTime.value--
    } else if (currentPlayer.value === 'black' && blackTime.value > 0) {
      blackTime.value--
    }
  }, 1000)
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function getPieceAt(x, y) {
  if (!board.value) return null
  const piece = board.value.getPiece(x, y)
  return piece === 0 ? null : piece
}

function selectPiece(row, col) {
  const piece = getPieceAt(col, row)
  if (!piece) return
  
  // Vérifier que c'est le tour du joueur dont on sélectionne le pion
  if (piece.color !== currentPlayer.value) {
    console.log(`C'est au tour de ${currentPlayer.value}!`)
    return
  }
  
  // Si il y a des captures obligatoires, vérifier que ce pion en fait partie
  if (mandatoryCapturePositions.value.length > 0 && !mandatoryCapturePositions.value.includes(`${col}_${row}`)) {
    console.log(`Ce pion doit capturer!`)
    return
  }
  
  selected.value = { row, col }
  // Utiliser getLegalMovesForPlayer pour forcer les captures si elles existent
  const legalMoves = Movement.getLegalMovesForPlayer(board.value, piece.color)
  validMoves.value = legalMoves.filter(m => m.from.x === col && m.from.y === row)
  console.log(`Pion sélectionné: Row ${row}, Col ${col}`, piece)
}

function isSelected(row, col) {
  return selected.value?.row === row && selected.value?.col === col
}

function isMandatoryCapture(row, col) {
  return mandatoryCapturePositions.value.includes(`${col}_${row}`)
}

function isValidMove(row, col) {
  return validMoves.value.some(m => m.x === col && m.y === row)
}

function handleCellClick(row, col) {
  if (isPaused.value) return
  
  if (isValidMove(row, col)) {
    movePiece(row, col)
  } else {
    selectPiece(row, col)
  }
}

function movePiece(toRow, toCol) {
  if (!selected.value) return
  
  const piece = getPieceAt(selected.value.col, selected.value.row)
  if (!piece) return
  
  // Trouver le mouvement dans validMoves pour vérifier si c'est une capture
  const moveData = validMoves.value.find(m => m.x === toCol && m.y === toRow)
  
  // Effectuer le mouvement
  board.value.movePiece(piece, toCol, toRow)
  
  // Si c'est une capture, enlever le pion capturé
  if (moveData && moveData.type === 'capture') {
    const capturedPiece = board.value.getPiece(moveData.capturedX, moveData.capturedY)
    if (capturedPiece !== 0) {
      board.value.setPiece(moveData.capturedX, moveData.capturedY, 0)
      console.log(`Pion ${capturedPiece.color} capturé!`)
    }
    
    // Raffle: vérifier si le pion peut capturer à nouveau
    const updatedPiece = board.value.getPiece(toCol, toRow)
    const legalMoves = Movement.getLegalMovesForPlayer(board.value, updatedPiece.color)
    const nextCaptures = legalMoves.filter(m => m.from.x === toCol && m.from.y === toRow && m.type === 'capture')
    
    if (nextCaptures.length > 0) {
      // Raffle possible! Garder ce pion sélectionné
      selected.value = { row: toRow, col: toCol }
      validMoves.value = nextCaptures
      mandatoryCapturePositions.value = [`${toCol}_${toRow}`]
      boardUpdate.value++
      console.log(`Raffle possible! Le pion à (${toCol}, ${toRow}) doit capturer à nouveau`)
      return
    }
  }
  
  selected.value = null
  validMoves.value = []
  mandatoryCapturePositions.value = []
  boardUpdate.value++  // Force le re-render
  
  // Basculer au joueur suivant
  currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
  console.log(`Pion déplacé vers: Row ${toRow}, Col ${toCol}. C'est au tour de ${currentPlayer.value}`)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.game-wrapper {
  display: flex;
  align-items: center;
  gap: 30px;
}

.board-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.timers-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 50px;
}

.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
  position: relative;
}

.board.paused {
  opacity: 0.6;
}

.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 4px;
}

.pause-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ff2200;
  text-shadow: 0 0 20px #ff2200;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.row {
  display: flex;
}

.cell {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark  { background-color: #8B4513; }
.light { background-color: #F5DEB3; }

.shadowed {
  position: relative;
}

.shadowed::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: rgba(2, 2, 2, 0.5);
  z-index: 1;
}

.piece {
  width: 75px; 
  height: 75px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
}

.piece.black { background: radial-gradient(circle at 35% 35%, #555, #111); }
.piece.white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }

.piece.draught {
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4), 0 0 0 4px rgba(255, 215, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.6);
  position: relative;
  border: 2px solid rgba(255, 215, 0, 0.7);
}

.piece.draught::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
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
  font-size: 2.2rem;
  color: rgba(255, 215, 0, 0.95);
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7), 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: bold;
}

.piece.draught.black {
  background: radial-gradient(circle at 35% 35%, #888, #111);
}

.piece.draught.white {
  background: radial-gradient(circle at 35% 35%, #fff, #e8e8e8);
}

.piece.selected {
  box-shadow: 0 0 12px 4px gold, inset 0 -4px 6px rgba(0,0,0,0.3);
  transform: scale(1.1);
}

.piece.draught.selected {
  box-shadow: 0 0 12px 4px gold, 0 0 0 3px rgba(255, 215, 0, 0.8), inset 0 -4px 6px rgba(0,0,0,0.3);
}

.piece.mandatoryCapture {
  box-shadow: 0 0 15px 6px #ff2200, inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
  animation: captureGlow 0.6s ease-in-out infinite;
}

@keyframes captureGlow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.pause-btn {
  padding: 12px 20px;
  border-radius: 8px;
  border: 2px solid #ff2200;
  background: rgba(255, 34, 0, 0.2);
  color: #ff2200;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.pause-btn:hover {
  background: rgba(255, 34, 0, 0.4);
  box-shadow: 0 0 10px #ff2200;
}

.pause-btn:active {
  transform: scale(0.95);
}
</style>