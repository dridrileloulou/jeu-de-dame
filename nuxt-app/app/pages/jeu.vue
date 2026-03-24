<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mode = computed(() => route.query.mode || 'local')
const difficulty = computed(() => {
  const level = route.query.level || 'normal'
  return level === 'normale' ? 'normal' : level
})

// ── État du plateau ───────────────────────────────────────────────
// 0 = vide, 1 = joueur humain (bas, avance vers rows décroissants = vers le haut)
//           2 = IA ou joueur 2 (haut, avance vers rows croissants = vers le bas)

function createInitialBoard() {
  const b = Array.from({ length: 10 }, () => Array(10).fill(0))
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 4)  b[r][c] = 2
        if (r > 5)  b[r][c] = 1
      }
    }
  }
  return b
}

const board        = ref(createInitialBoard())
const currentPlayer = ref(1)
const selected     = ref(null)   // { r, c }
const aiThinking   = ref(false)
const message      = ref('')

// ── Logique des coups ─────────────────────────────────────────────

function getCaptures(b, r, c, player) {
  const opponent = player === 1 ? 2 : 1
  const dirs = player === 1
    ? [[-2, -2, -1, -1], [-2, 2, -1, 1]]
    : [[2, -2, 1, -1], [2, 2, 1, 1]]
  return dirs
    .filter(([dr, dc, mr, mc]) => {
      const tr = r + dr, tc = c + dc, mr_ = r + mr, mc_ = c + mc
      return tr >= 0 && tr < 10 && tc >= 0 && tc < 10
        && b[mr_][mc_] === opponent && b[tr][tc] === 0
    })
    .map(([dr, dc, mr, mc]) => ({
      from: [r, c], to: [r + dr, c + dc], over: [r + mr, c + mc]
    }))
}

function getSimpleMoves(b, r, c, player) {
  const dirs = player === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
  return dirs
    .filter(([dr, dc]) => {
      const tr = r + dr, tc = c + dc
      return tr >= 0 && tr < 10 && tc >= 0 && tc < 10 && b[tr][tc] === 0
    })
    .map(([dr, dc]) => ({ from: [r, c], to: [r + dr, c + dc] }))
}

function getAllLegalMoves(b, player) {
  const captures = []
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++)
      if (b[r][c] === player) captures.push(...getCaptures(b, r, c, player))
  if (captures.length > 0) return captures

  const moves = []
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++)
      if (b[r][c] === player) moves.push(...getSimpleMoves(b, r, c, player))
  return moves
}

function isMoveValid(move, player) {
  return getAllLegalMoves(board.value, player).some(m =>
    m.from[0] === move.from[0] && m.from[1] === move.from[1] &&
    m.to[0]   === move.to[0]   && m.to[1]   === move.to[1]
  )
}

function applyMove(move) {
  const b = board.value.map(row => [...row])
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  b[tr][tc] = b[fr][fc]
  b[fr][fc] = 0
  // suppression de la pièce capturée
  if (move.over) {
    b[move.over[0]][move.over[1]] = 0
  } else if (Math.abs(tr - fr) === 2) {
    b[fr + (tr - fr) / 2][fc + (tc - fc) / 2] = 0
  }
  board.value = b
}

function checkWin() {
  const flat = board.value.flat()
  const p1 = flat.filter(v => v === 1).length
  const p2 = flat.filter(v => v === 2).length
  if (p1 === 0) { message.value = "L'IA a gagné !";    return true }
  if (p2 === 0) { message.value = "Vous avez gagné !"; return true }
  if (getAllLegalMoves(board.value, 1).length === 0) { message.value = "L'IA a gagné (blocage) !";    return true }
  if (getAllLegalMoves(board.value, 2).length === 0) { message.value = "Vous avez gagné (blocage) !"; return true }
  return false
}

// ── Clic du joueur humain ─────────────────────────────────────────

function onCellClick(r, c) {
  if (aiThinking.value || message.value) return
  if (mode.value === 'ia' && currentPlayer.value !== 1) return

  const cell = board.value[r][c]

  if (cell === currentPlayer.value) {
    selected.value = { r, c }
    return
  }

  if (selected.value && cell === 0) {
    const move = { from: [selected.value.r, selected.value.c], to: [r, c] }
    if (isMoveValid(move, currentPlayer.value)) {
      applyMove(move)
      selected.value = null
      if (!checkWin()) {
        const next = currentPlayer.value === 1 ? 2 : 1
        currentPlayer.value = next
        if (mode.value === 'ia' && next === 2) askAI()
      }
    } else {
      message.value = "Coup invalide"
      setTimeout(() => { message.value = '' }, 1500)
    }
    return
  }

  selected.value = null
}

// ── Appel IA ──────────────────────────────────────────────────────

async function askAI() {
  aiThinking.value = true
  try {
    const res = await fetch('http://localhost:3001/ai/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: board.value,
        currentPlayer: 2,
        difficulty: difficulty.value,
      })
    })

    const data = await res.json()

    if (!res.ok || !data.move) throw new Error('Réponse invalide')

    if (isMoveValid(data.move, 2)) {
      applyMove(data.move)
    } else {
      // Gemini a hallucine → on joue le premier coup légal disponible
      const legal = getAllLegalMoves(board.value, 2)
      if (legal.length > 0) applyMove(legal[0])
    }

    if (!checkWin()) currentPlayer.value = 1

  } catch {
    message.value = "Serveur IA inaccessible"
    setTimeout(() => { message.value = '' }, 2000)
    currentPlayer.value = 1
  } finally {
    aiThinking.value = false
  }
}

// ── Helpers CSS ───────────────────────────────────────────────────

function isDark(r, c)     { return (r + c) % 2 === 1 }
function isSelected(r, c) { return selected.value?.r === r && selected.value?.c === c }
function turnLabel()      { return currentPlayer.value === 1 ? 'Votre tour' : "Tour de l'IA" }
</script>

<template>
  <div class="game">
    <div class="header">
      <NuxtLink to="/" class="back">← Retour</NuxtLink>
      <span class="turn-label">
        <template v-if="aiThinking">L'IA réfléchit...</template>
        <template v-else-if="message">{{ message }}</template>
        <template v-else>{{ turnLabel() }}</template>
      </span>
    </div>

    <div class="board">
      <div
        v-for="r in 10" :key="r"
        class="row"
      >
        <div
          v-for="c in 10" :key="c"
          :class="['square', isDark(r-1, c-1) ? 'dark' : 'light', isSelected(r-1, c-1) ? 'selected' : '']"
          @click="onCellClick(r-1, c-1)"
        >
          <div
            v-if="board[r-1][c-1] === 1"
            class="piece piece-1"
          />
          <div
            v-else-if="board[r-1][c-1] === 2"
            class="piece piece-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  min-height: 100vh;
  background: #1e1e2f;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-family: Arial, sans-serif;
  padding: 1rem;
}

.header {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.back {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
}

.turn-label {
  font-size: 1rem;
  font-style: italic;
  color: #ccc;
}

.board {
  display: flex;
  flex-direction: column;
  border: 4px solid #555;
}

.row {
  display: flex;
}

.square {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.light    { background: #f0d9b5; }
.dark     { background: #b58863; }
.selected { outline: 3px solid yellow; outline-offset: -3px; }

.piece {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.4);
}

.piece-1 { background: radial-gradient(circle at 35% 35%, #fff, #ddd); }
.piece-2 { background: radial-gradient(circle at 35% 35%, #555, #111); }
</style>