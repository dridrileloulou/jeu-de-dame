<template>
  <div class="game">
    <div class="game-content">
      <NavMenu />
      <GameBoardIA v-if="ready" :level="level" :saved-game-id="resumeId" :initial-state="resumeState" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavMenu from '../components/NavMenu.vue'
import GameBoardIA from '../components/game/GameBoardIA.vue'

const route = useRoute()
const level = computed(() => route.query.level || 'normale')

const resumeId    = ref(null)
const resumeState = ref(null)
const ready       = ref(false)

onMounted(async () => {
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
body {
  overflow: hidden;
}
</style>

<style scoped>
.game {
  min-height: 100vh;
  background:#abaaaa;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-family: Arial, sans-serif;
}

.game-content {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin: 2rem 0;
  margin-left : 100px;
}

.back {
  color: white;
}
</style>