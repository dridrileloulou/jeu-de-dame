<template>
  <div class="game">
    <div class="game-content">
      <NavMenu />
      <GameBoardIA v-if="gameMode === 'ia'" />
      <GameBoardOffline v-else-if="gameMode === 'local'" />
      <GameBoardOnline v-else-if="gameMode === 'online'" />
      <GameBoard v-else :on-chat-event="notifyChat" />
      <ChatIA v-if="gameMode !== 'ia' && gameMode !== 'local' && gameMode !== 'online'" ref="chatRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import NavMenu from '../components/NavMenu.vue'
import GameBoard from '../components/game/GameBoard.vue'
import GameBoardIA from '../components/game/GameBoardIA.vue'
import GameBoardOffline from '../components/game/GameBoardOffline.vue'
import GameBoardOnline from '../components/game/GameBoardOnline.vue'
import ChatIA from '../components/game/ChatIA.vue'

const route = useRoute()
const gameMode = computed(() => route.query.mode || 'local')
const chatRef = ref(null)

function notifyChat(event) {
  chatRef.value?.triggerEvent(event)
}
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