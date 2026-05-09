<template>
  <GameBoardIA v-if="ready" :level="level" :saved-game-id="resumeId" :initial-state="resumeState" :is-demo="!!resumeState?.isDemo" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GameBoardIA from '../components/game/GameBoardIA.vue'

const route = useRoute()
const level = computed(() => route.query.level || 'normale')

const resumeId    = ref(null)
const resumeState = ref(null)
const ready       = ref(false)

function buildDemoBoard() {
  const b = Array.from({ length: 10 }, () => Array(10).fill(null))
  b[1][3] = { color: 'black', isDraught: false }
  b[1][7] = { color: 'black', isDraught: false }
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
body { overflow: hidden; }
@media (max-width: 700px) {
  body { overflow-x: hidden; overflow-y: auto; }
}
</style>
