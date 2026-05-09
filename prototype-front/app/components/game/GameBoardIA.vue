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
        <div class="debrief-section">
          <div class="debrief-header">
            <span class="debrief-icon">✦</span>
            <span class="debrief-label">Analyse de la partie</span>
          </div>
          <div v-if="debriefLoading" class="debrief-loading">
            <span class="debrief-dot"></span>
            <span class="debrief-dot"></span>
            <span class="debrief-dot"></span>
          </div>
          <p v-else-if="debrief" class="debrief-text">{{ debrief }}</p>
          <p v-else class="debrief-text debrief-unavailable">Analyse indisponible.</p>
        </div>
        <div class="gameover-btns">
          <NuxtLink to="/" class="gameover-btn">← Accueil</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Bande IA (haut) -->
    <div class="side-panel top-panel" :class="{ 'panel-active': currentPlayer === 'black' }">
      <div class="player-info">
        <div class="player-dot dot-black"></div>
        <span class="player-name">IA ({{ level }})</span>
        <div class="inline-caps">
          <span v-for="i in blackCaptured" :key="i" class="inline-pip pip--white"></span>
          <span v-if="blackCaptured > 0" class="inline-cap-count">×{{ blackCaptured }}</span>
        </div>
      </div>
    </div>

    <!-- Plateau + panneau droit -->
    <div class="board-container">
      <div class="board" :class="{ paused: isPaused }">
        <div class="pause-overlay" v-if="isPaused">
          <div class="pause-content">
            <div class="pause-text">PAUSE</div>
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
              'last-from': lastMovePath.length >= 1 && lastMovePath[0]?.x === col && lastMovePath[0]?.y === row,
              'last-to':   lastMovePath.length >= 2 && lastMovePath[lastMovePath.length-1]?.x === col && lastMovePath[lastMovePath.length-1]?.y === row,
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
                mandatoryCapture: isMandatoryCapture(row, col),
                locked: currentPlayer === 'black' || getPieceAt(col, row)?.color === 'black'
              }"
              @click.stop="selectPiece(row, col)"
            />
          </div>
        </div>

        <svg
          v-if="arrowSegments.length"
          class="move-arrow"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <marker id="ia-arrowhead" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill="rgba(210,160,50,0.75)" />
            </marker>
          </defs>
          <line
            v-for="(seg, i) in arrowSegments"
            :key="i"
            :x1="seg.x1" :y1="seg.y1" :x2="seg.x2" :y2="seg.y2"
            stroke="rgba(210,160,50,0.55)"
            stroke-width="1.1"
            stroke-linecap="round"
            marker-end="url(#ia-arrowhead)"
          />
        </svg>
      </div>

      <!-- Panneau droit -->
      <div class="right-panel">
        <div class="turn-indicator" :class="[currentPlayer, { 'my-turn': currentPlayer === 'white' }]">
          <div class="turn-dot" :class="currentPlayer === 'white' ? 'dot-white' : 'dot-black'"></div>
          {{ currentPlayer === 'white' ? 'Votre tour' : "Tour de l'IA" }}
        </div>

        <ChatIA ref="chatRef" />

        <button v-if="loggedIn" class="save-pause-btn" :class="{ saved: justSaved && !isPaused, paused: isPaused }" :disabled="saving" @click="isPaused ? togglePause() : savePause()">
          {{ isPaused ? '▶ Reprendre' : justSaved ? '✓ Sauvegardé' : saving ? '…' : '💾 Pause & Sauvegarder' }}
        </button>
        <button v-else class="pause-btn" @click="togglePause">
          {{ isPaused ? '▶ Reprendre' : '⏸ Pause' }}
        </button>

        <NuxtLink to="/" class="btn-home">← Accueil</NuxtLink>
      </div>
    </div>

    <!-- Bande joueur (bas) -->
    <div class="side-panel bottom-panel" :class="{ 'panel-active': currentPlayer === 'white' }">
      <div class="player-info">
        <div class="player-dot dot-white"></div>
        <span class="player-name">Vous (Blanc)</span>
        <div class="inline-caps">
          <span v-for="i in whiteCaptured" :key="i" class="inline-pip pip--black"></span>
          <span v-if="whiteCaptured > 0" class="inline-cap-count">×{{ whiteCaptured }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Game } from '../../engine/Game.js'
import ChatIA from './ChatIA.vue'

const props = defineProps({
  level:        { type: String, default: 'normale' },
  savedGameId:  { type: String, default: null },
  initialState: { type: Object, default: null },
  isDemo:       { type: Boolean, default: false },
})

const { loggedIn } = useUserSession()

let game = null
const rev = ref(0)
const currentPlayer = ref('white')
const isPaused = ref(false)
const winner = ref(null)
const whiteCaptured = ref(0)
const blackCaptured = ref(0)
const lastMovePath = ref([])
let aiMovePathBuffer = []

const chatRef = ref(null)

const debrief        = ref(null)
const debriefLoading = ref(false)
let moveHistory = []

const savedId       = ref(props.savedGameId)
const saving        = ref(false)
const justSaved     = ref(false)
const demoSnapshot  = ref(null)

onMounted(() => {
  if (props.initialState) {
    const s = props.initialState
    game = Game.restore(s.board, s.currentPlayer)
    currentPlayer.value = s.currentPlayer
    whiteCaptured.value = s.whiteCaptured
    blackCaptured.value = s.blackCaptured
    demoSnapshot.value  = s.demoSnapshot || null
  } else {
    game = new Game()
  }
  rev.value++
})

watch(currentPlayer, (newVal) => {
  if (newVal === 'black' && !winner.value) {
    setTimeout(() => aiPlay(false), 800)
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
    if (props.isDemo && demoSnapshot.value) {
      const snap = demoSnapshot.value
      await $fetch('/api/local-games', {
        method: 'POST',
        body: {
          id: savedId.value,
          whiteName: 'Joueur',
          blackName: `IA (${props.level})`,
          currentPlayer: snap.currentPlayer,
          whiteCaptured: snap.whiteCaptured,
          blackCaptured: snap.blackCaptured,
          timerSeconds: 0,
          whiteTime: snap.whiteTime || 0,
          blackTime: snap.blackTime || 0,
          board: snap.board,
          mode: 'ia',
          level: props.level
        }
      })
    } else {
      await $fetch(`/api/local-games/${savedId.value}`, { method: 'DELETE' })
      savedId.value = null
    }
  } catch {}
}

const arrowSegments = computed(() => {
  const path = lastMovePath.value
  if (!path || path.length < 2) return []
  const segments = []
  for (let i = 0; i < path.length - 1; i++) {
    const f = path[i], t = path[i + 1]
    const fx = (f.x + 0.5) * 10, fy = (f.y + 0.5) * 10
    const tx = (t.x + 0.5) * 10, ty = (t.y + 0.5) * 10
    const dx = tx - fx, dy = ty - fy
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len === 0) continue
    const ux = dx / len, uy = dy / len
    segments.push({ x1: fx + ux * 4.2, y1: fy + uy * 4.2, x2: tx - ux * 4.5, y2: ty - uy * 4.5 })
  }
  return segments
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
        moveHistory.push({ player: 'white', from: result.from, to: result.to, captured: !!result.captured })
        lastMovePath.value = []
        aiMovePathBuffer = []
        // Coach analysis — bloque l'IA max 8s
        try {
          const boardMatrix = game.board.board.map(r =>
            r.map(cell => (cell === 0 || cell == null) ? 0 : cell.color === 'white' ? 2 : 1)
          )
          const coachData = await Promise.race([
            $fetch('/api/coach-move', { method: 'POST', body: { from: result.from, to: result.to, captured: !!result.captured, board: boardMatrix } }),
            new Promise(r => setTimeout(r, 8000))
          ])
          if (coachData?.analysis) await chatRef.value?.showCoachAnalysis(coachData.analysis)
        } catch {}
        currentPlayer.value = result.nextPlayer
        rev.value++
        const w = game.checkWinner()
        if (w) { winner.value = w; recordStat(w); deleteSavedGame(); fetchDebrief(w) }
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

async function fetchDebrief(winnerColor) {
  debriefLoading.value = true
  try {
    const data = await $fetch('/api/game-debrief', {
      method: 'POST',
      body: {
        history: moveHistory,
        winner: winnerColor,
        whiteCaptured: whiteCaptured.value,
        blackCaptured: blackCaptured.value,
      }
    })
    debrief.value = data.debrief || null
  } catch {
    debrief.value = null
  }
  debriefLoading.value = false
}

async function aiPlay(isContinuation = false) {
  if (!game || winner.value || isPaused.value) return
  if (!isContinuation && currentPlayer.value !== 'black') return
  if (!isContinuation) aiMovePathBuffer = []

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
      chatRef.value?.showAiMove({
        type:     data.usedMinimax ? 'minimax' : 'gemini',
        analysis: data.analysis || null,
        moveStr:  data.aiMove
      })
      return
    }
    console.warn('[IA] Move rejected by engine:', data.aiMove, '— using local fallback')
  } catch (err) {
    console.error('Erreur IA Play:', err)
  }

  chatRef.value?.showAiMove({ type: 'auto', analysis: null, moveStr: null })
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
  if (aiMovePathBuffer.length === 0) aiMovePathBuffer.push(result.from)
  aiMovePathBuffer.push(result.to)
  lastMovePath.value = [...aiMovePathBuffer]
  moveHistory.push({ player: 'black', from: result.from, to: result.to, captured: !!result.captured })
  if (result.continuation) {
    rev.value++
    setTimeout(() => aiPlay(true), 600)
  } else {
    currentPlayer.value = result.nextPlayer
    rev.value++
    const w = game.checkWinner()
    if (w) { winner.value = w; recordStat(w); deleteSavedGame(); fetchDebrief(w) }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ── Layout principal ─────────────────────────────────────────── */
.game-wrapper {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.7rem;
  overflow: hidden;
  background: #abaaaa;
}

/* ── Bandes joueur haut/bas ───────────────────────────────────── */
.side-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1080px;
  padding: 0.45rem 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  gap: 1rem;
  transition: background 0.3s, box-shadow 0.3s;
}

.panel-active {
  background: rgba(255, 255, 255, 0.1) !important;
  border-left: 3px solid rgba(255, 255, 255, 0.6);
  animation: turn-glow 1.8s ease-in-out infinite;
}

@keyframes turn-glow {
  0%, 100% { box-shadow: 0 0 6px rgba(255, 255, 255, 0.15); }
  50%       { box-shadow: 0 0 16px rgba(255, 255, 255, 0.4); }
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
}

.player-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.dot-white { background: #ffffff; }
.dot-black { background: #222222; }

.player-name { font-size: 0.9rem; }

.inline-caps {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  margin-left: 0.4rem;
}

.inline-pip {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: inset 0 -1px 3px rgba(0, 0, 0, 0.3);
}

.inline-cap-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 2px;
}

/* ── Board container (plateau + panneau droit) ────────────────── */
.board-container {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.9rem;
  background: #444444;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

/* ── Plateau ──────────────────────────────────────────────────── */
.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
  position: relative;
  background-color: #0a0a0a;
}

.board.paused::after {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.4);
  z-index: 5;
}

.row { display: flex; }

.cell {
  /* Width overhead: 2×0.7rem wrapper pad + 2×0.9rem container pad + 10px border + 1.2rem gap + right-panel(~290px) ≈ 410px */
  /* Height overhead: 2×0.7rem pad + 2×0.55rem gap + 2×(0.45rem+ligne) strip (~90px) + 2×0.9rem container pad + 10px border ≈ 230px */
  width: clamp(32px, min(calc((100vw - 410px) / 10), calc((100dvh - 230px) / 10)), 78px);
  height: clamp(32px, min(calc((100vw - 410px) / 10), calc((100dvh - 230px) / 10)), 78px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dark  { background-color: #262626; }
.light { background-color: #b0b0b0; }

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

.shadowed::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 45%; height: 45%;
  border-radius: 50%;
  background: rgba(2, 2, 2, 0.5);
  z-index: 1;
}

/* ── Pions ────────────────────────────────────────────────────── */
.piece {
  width: 80%; height: 80%;
  border-radius: 50%;
  border: 3px solid rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease;
}

.piece.black { background: radial-gradient(circle at 35% 35%, #555, #111); }
.piece.white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }

.piece.selected {
  box-shadow: 0 0 12px 4px gold, inset 0 -4px 6px rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
}

.piece.locked { cursor: default; opacity: 0.8; }

.piece.mandatoryCapture {
  box-shadow: 0 0 15px 6px #ff2200, inset 0 -4px 6px rgba(0, 0, 0, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.4);
  animation: captureGlow 0.6s ease-in-out infinite;
}

@keyframes captureGlow {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.piece.draught {
  box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.3), 2px 2px 4px rgba(0, 0, 0, 0.4),
              0 0 0 4px rgba(255, 215, 0, 0.9), 0 0 15px rgba(255, 215, 0, 0.6);
  border: 2px solid rgba(255, 215, 0, 0.7);
}

.piece.draught::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 60%; height: 60%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 200, 0.8), transparent);
  border-radius: 50%;
  z-index: -1;
}

.piece.draught::after {
  content: '♛';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  font-size: clamp(1rem, 3vh, 2.2rem);
  color: rgba(255, 215, 0, 0.95);
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
}

/* ── Pause overlay ────────────────────────────────────────────── */
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

/* ── Panneau droit ────────────────────────────────────────────── */
.right-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.65rem;
  width: 280px;
  min-width: 240px;
}

.turn-indicator {
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.88rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.turn-indicator.white { background: #fff; color: #262626; }
.turn-indicator.black { background: #262626; color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }

.turn-indicator.my-turn {
  animation: my-turn-pulse 1.8s ease-in-out infinite;
}

@keyframes my-turn-pulse {
  0%, 100% { box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.2); }
  50%       { box-shadow: 0 0 18px 6px rgba(255, 255, 255, 0.5); }
}

.turn-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.3);
}

/* ChatIA adapté au panneau droit */
.right-panel :deep(.chat-wrapper) {
  width: 100% !important;
  min-width: 0 !important;
  height: 280px !important;
  min-height: 0 !important;
  border-radius: 12px;
  flex: 1;
}

.save-pause-btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 2px solid #2ed573;
  background: rgba(46, 213, 115, 0.15);
  color: #2ed573;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.save-pause-btn:hover:not(:disabled) { background: rgba(46, 213, 115, 0.3); }
.save-pause-btn.saved  { border-color: #7bed9f; color: #7bed9f; }
.save-pause-btn.paused { border-color: #ff2200; background: rgba(255, 34, 0, 0.2); color: #ff2200; }
.save-pause-btn.paused:hover { background: rgba(255, 34, 0, 0.4); }
.save-pause-btn:disabled { opacity: 0.5; cursor: default; }

.pause-btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 2px solid #ff2200;
  background: rgba(255, 34, 0, 0.2);
  color: #ff2200;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: background 0.2s;
}
.pause-btn:hover { background: rgba(255, 34, 0, 0.4); }

.btn-home {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-home:hover { background: rgba(255, 255, 255, 0.2); }

/* ── Game Over ────────────────────────────────────────────────── */
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
  max-width: 90vw;
}

.gameover-icon  { font-size: 3.5rem; line-height: 1; }
.gameover-title { margin: 0; font-size: 1.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.gameover-reason { margin: -0.5rem 0 0; font-size: 0.9rem; color: rgba(255, 255, 255, 0.5); }

.gameover-scores {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
}

.gscore         { display: flex; align-items: center; gap: 0.5rem; }
.gscore-pip     { display: inline-block; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.3); box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3); }
.gscore-label   { font-size: 0.9rem; color: rgba(255,255,255,0.6); }
.gscore-val     { font-size: 1.3rem; font-weight: 700; }
.gscore-sep     { color: rgba(255,255,255,0.3); font-size: 1.2rem; }

.gameover-btns { display: flex; gap: 0.7rem; margin-top: 0.2rem; }

.gameover-btn {
  padding: 0.75rem 2rem;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.35);
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
.gameover-btn:hover { background: rgba(255,255,255,0.25); }

/* ── Debrief ──────────────────────────────────────────────────── */
.debrief-section {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 420px;
}

.debrief-header { display: flex; align-items: center; gap: 0.5rem; }
.debrief-icon   { font-size: 0.75rem; color: rgba(210,180,90,0.8); }
.debrief-label  { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(210,180,90,0.8); }
.debrief-text   { margin: 0; font-size: 0.88rem; line-height: 1.6; color: rgba(255,255,255,0.82); }
.debrief-unavailable { color: rgba(255,255,255,0.35); font-style: italic; }

.debrief-loading { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
.debrief-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: rgba(210,180,90,0.7);
  animation: debrief-bounce 1.2s ease-in-out infinite;
}
.debrief-dot:nth-child(2) { animation-delay: .2s; }
.debrief-dot:nth-child(3) { animation-delay: .4s; }
@keyframes debrief-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .4; }
  40%           { transform: translateY(-5px); opacity: 1; }
}

/* ── Couleurs pions partagées ─────────────────────────────────── */
.pip--white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }
.pip--black { background: radial-gradient(circle at 35% 35%, #555, #111); }

/* ── Mobile (≤700px) ──────────────────────────────────────────── */
@media (max-width: 700px) {
  .game-wrapper {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
    justify-content: flex-start;
    padding: 0.4rem;
    gap: 0.35rem;
  }

  .side-panel {
    padding: 0.35rem 0.6rem;
    max-width: 100%;
  }

  .player-name { font-size: 0.78rem; }

  .board-container {
    flex-direction: column;
    padding: 6px;
    gap: 6px;
  }

  .cell {
    width: min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10));
    height: min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10));
  }

  .right-panel {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    min-width: unset;
    gap: 0.5rem;
  }

  .right-panel :deep(.chat-wrapper) {
    width: 100% !important;
    height: 180px !important;
    order: 10;
  }

  .turn-indicator  { flex: 1; font-size: 0.78rem; padding: 0.5rem; }
  .save-pause-btn,
  .pause-btn       { flex: 1; font-size: 0.78rem; white-space: nowrap; }
  .btn-home        { flex: 0; font-size: 0.78rem; }
}
</style>
