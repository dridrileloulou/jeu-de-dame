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
          <NuxtLink to="/" class="gameover-btn">← Accueil</NuxtLink>
        </div>
      </div>
    </div>

    <div class="board-section">
      <div class="turn-banner" :class="currentPlayer">
        <span class="turn-dot-sm" :class="currentPlayer === 'white' ? 'dot-white' : 'dot-black'"></span>
        {{ currentPlayer === 'white' ? 'Votre tour (Blanc)' : "Tour de l'IA (Noir)" }}
      </div>
    <div class="board-container">
      <div class="board" :class="{ paused: isPaused }">
        <div class="pause-overlay" v-if="isPaused">
          <div class="pause-content">
            <div class="pause-text">PAUSE</div>
            <NuxtLink to="/" class="pause-home-btn">← Accueil</NuxtLink>
          </div>
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
                mandatoryCapture: isMandatoryCapture(row, col),
                locked: currentPlayer === 'black' || getPieceAt(col, row)?.color === 'black'
              }"
              @click.stop="selectPiece(row, col)"
            />
          </div>
        </div>

        <!-- Flèche SVG du dernier coup IA -->
        <svg
          v-if="arrowCoords"
          class="move-arrow"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="ia-arrowhead" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill="rgba(210,160,50,0.65)" />
            </marker>
          </defs>
          <line
            :x1="arrowCoords.x1"
            :y1="arrowCoords.y1"
            :x2="arrowCoords.x2"
            :y2="arrowCoords.y2"
            stroke="rgba(210,160,50,0.5)"
            stroke-width="1.1"
            stroke-linecap="round"
            marker-end="url(#ia-arrowhead)"
          />
        </svg>
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
        <button v-if="loggedIn" class="save-pause-btn" :class="{ saved: justSaved && !isPaused, paused: isPaused }" :disabled="saving" @click="isPaused ? togglePause() : savePause()">
          {{ isPaused ? '▶ Reprendre' : justSaved ? '✓ Sauvegardé' : saving ? '…' : '💾 Pause & Sauvegarder' }}
        </button>
        <button v-else class="pause-btn" @click="togglePause">
          {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
        </button>
      </div>
    </div>
    </div><!-- board-section -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Game } from '../../engine/Game.js'
import PlayerTurn from './PlayerTurn.vue'

const props = defineProps({
  gameMode:     { type: String, default: 'local' },
  level:        { type: String, default: 'normale' },
  savedGameId:  { type: String, default: null },
  initialState: { type: Object, default: null },
  onAiMove:     { type: Function, default: null },
  onPlayerMove: { type: Function, default: null }
})

const { loggedIn } = useUserSession()

let game = null
const rev = ref(0)
const currentPlayer = ref('white')
const isPaused = ref(false)
const winner = ref(null)
const whiteCaptured = ref(0)
const blackCaptured = ref(0)
const lastMoveFrom = ref(null)
const lastMoveTo   = ref(null)

const savedId   = ref(props.savedGameId)
const saving    = ref(false)
const justSaved = ref(false)

onMounted(() => {
  if (props.initialState) {
    const s = props.initialState
    game = Game.restore(s.board, s.currentPlayer)
    currentPlayer.value = s.currentPlayer
    whiteCaptured.value = s.whiteCaptured
    blackCaptured.value = s.blackCaptured
  } else {
    game = new Game()
  }
  rev.value++
  if (currentPlayer.value === 'black') aiPlay()
})

watch(currentPlayer, (newVal) => {
  if (newVal === 'black' && !winner.value) {
    // Petit délai pour le réalisme
    setTimeout(aiPlay, 800)
  }
})

function togglePause() { isPaused.value = !isPaused.value }

async function savePause() {
  isPaused.value = true
  await saveGame()
}

async function saveGame() {
  if (!game || saving.value) return
  saving.value = true
  try {
    const res = await $fetch('/api/local-games', {
      method: 'POST',
      body: {
        id: savedId.value,
        whiteName: 'Joueur',
        blackName: `IA (${props.level})`,
        currentPlayer: currentPlayer.value,
        whiteCaptured: whiteCaptured.value,
        blackCaptured: blackCaptured.value,
        timerSeconds: 0,
        whiteTime: 0,
        blackTime: 0,
        board: game.serialize(),
        mode: 'ia',
        level: props.level
      }
    })
    savedId.value = res.id
    justSaved.value = true
    setTimeout(() => { justSaved.value = false }, 2000)
  } catch {}
  saving.value = false
}

async function deleteSavedGame() {
  if (!savedId.value) return
  try {
    await $fetch(`/api/local-games/${savedId.value}`, { method: 'DELETE' })
    savedId.value = null
  } catch {}
}

// Coordonnées SVG de la flèche, raccourcies pour ne pas chevaucher les pions
const arrowCoords = computed(() => {
  if (!lastMoveFrom.value || !lastMoveTo.value) return null
  const fx = (lastMoveFrom.value.x + 0.5) * 10
  const fy = (lastMoveFrom.value.y + 0.5) * 10
  const tx = (lastMoveTo.value.x + 0.5) * 10
  const ty = (lastMoveTo.value.y + 0.5) * 10
  const dx = tx - fx, dy = ty - fy
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null
  const ux = dx / len, uy = dy / len
  return {
    x1: fx + ux * 4,   // départ : après le bord du pion source
    y1: fy + uy * 4,
    x2: tx - ux * 4.5, // arrivée : avant le bord du pion destination
    y2: ty - uy * 4.5,
  }
})

function getPieceAt(x, y)         { rev.value; return game?.getPiece(x, y) ?? null }
function isSelected(row, col)     { rev.value; return game?.isSelected(row, col) ?? false }
function isValidMove(row, col)    { rev.value; return game?.isValidMove(row, col) ?? false }
function isMandatoryCapture(r, c) { rev.value; return game?.isMandatory(r, c) ?? false }

function selectPiece(row, col) {
  if (!game || currentPlayer.value === 'black') return
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

async function handleCellClick(row, col) {
  if (isPaused.value || !game || winner.value || currentPlayer.value === 'black') return
  if (game.isValidMove(row, col)) {
    const movingPlayer = currentPlayer.value
    const result = game.executeMove(row, col)
    if (result) {
      if (result.captured) {
        if (movingPlayer === 'white') whiteCaptured.value++
        else blackCaptured.value++
      }
      if (!result.continuation) {
        // Effacer la trace du coup IA dès que le joueur joue
        if (movingPlayer === 'white') {
          lastMoveFrom.value = null
          lastMoveTo.value   = null
        }
        // Attendre l'analyse coach avant de laisser l'IA jouer (max 8s)
        if (movingPlayer === 'white' && props.onPlayerMove) {
          const boardMatrix = game.board.board.map(r =>
            r.map(cell => (cell === 0 || cell == null) ? 0 : cell.color === 'white' ? 2 : 1)
          )
          await Promise.race([
            props.onPlayerMove({ from: result.from, to: result.to, captured: !!result.captured, board: boardMatrix }),
            new Promise(r => setTimeout(r, 8000))
          ])
        }
        currentPlayer.value = result.nextPlayer
        if (movingPlayer === 'black') {
          lastMoveFrom.value = result.from
          lastMoveTo.value   = result.to
        } else {
          lastMoveFrom.value = null
          lastMoveTo.value   = null
        }
        rev.value++
        const w = game.checkWinner()
        if (w) { winner.value = w; recordStat(w); deleteSavedGame() }
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
      body: {
        mode: 'ia',
        result: winnerColor === 'white' ? 'win' : 'loss',
        opponent: props.level,
        reason: 'no_pieces'
      }
    })
  } catch {}
}

async function aiPlay() {
  if (!game || winner.value || isPaused.value) return

  const boardMatrix = game.board.board.map(row =>
    row.map(cell => {
      if (cell === 0 || cell == null) return 0
      return cell.color === 'white' ? 2 : 1
    })
  )

  const levelMap = { 'facile': 1, 'normale': 2, 'normal': 2, 'difficile': 3, 'expert': 4 }
  const levelNum = levelMap[props.level] || 2

  try {
    const data = await $fetch('/api/ia-move', {
      method: 'POST',
      body: { board: boardMatrix, level: levelNum, player: 1 }
    })

    if (data.aiMove && applyAiMove(data.aiMove)) {
      if (props.onAiMove) {
        props.onAiMove({
          type:     data.usedMinimax ? 'minimax' : 'gemini',
          analysis: data.analysis || null,
          moveStr:  data.aiMove
        })
      }
      return
    }
    console.warn('[IA] Move rejected by engine:', data.aiMove, '— using local fallback')
  } catch (err) {
    console.error('Erreur IA Play:', err)
  }

  if (props.onAiMove) props.onAiMove({ type: 'auto', analysis: null, moveStr: null })
  applyLocalFallback()
}

function applyAiMove(moveStr) {
  const parts = moveStr.trim().split(' ')
  if (parts.length < 2) return false
  const [r1, c1] = parts[0].split(',').map(Number)
  const [r2, c2] = parts[1].split(',').map(Number)
  if (!game.selectPiece(r1, c1, 'black')) return false
  const result = game.executeMove(r2, c2)
  if (!result) return false
  commitAiResult(result)
  return true
}

function applyLocalFallback() {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (game.selectPiece(row, col, 'black') && game._validMoves.length > 0) {
        const m = game._validMoves[0]
        const result = game.executeMove(m.y, m.x)
        if (result) { commitAiResult(result); return }
      }
    }
  }
}

function commitAiResult(result) {
  if (result.captured) blackCaptured.value++
  if (result.continuation) {
    rev.value++
    setTimeout(aiPlay, 600)
  } else {
    currentPlayer.value = result.nextPlayer
    lastMoveFrom.value = result.from
    lastMoveTo.value = result.to
    rev.value++
    const w = game.checkWinner()
    if (w) { winner.value = w; recordStat(w); deleteSavedGame() }
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

.cell.last-from { background-color: #4a3f30 !important; }
.cell.last-to   { background-color: #5e4500 !important; }

.move-arrow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
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

.piece.locked {
  cursor: default;
  opacity: 0.8;
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

.save-pause-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #2ed573;
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.save-pause-btn:hover:not(:disabled) { background: rgba(46, 213, 115, 0.3); }
.save-pause-btn.saved { border-color: #7bed9f; color: #7bed9f; }
.save-pause-btn.paused { border-color: #ff2200; background: rgba(255,34,0,0.2); color: #ff2200; }
.save-pause-btn.paused:hover { background: rgba(255,34,0,0.4); }
.save-pause-btn:disabled { opacity: 0.5; cursor: default; }

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
.pause-btn:hover { background: rgba(255, 34, 0, 0.4); }

.pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.pause-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pause-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ff2200;
  text-shadow: 0 0 20px #ff2200;
}

.pause-home-btn {
  padding: 8px 20px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background 0.2s;
  z-index: 11;
}
.pause-home-btn:hover { background: rgba(255,255,255,0.22); }


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