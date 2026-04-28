<template>
  <div class="game">
    <div class="game-content">
      <NavMenu />
      <GameBoardOnline />
    </div>
  </div>
</template>

<script setup>
import NavMenu from '../components/NavMenu.vue'
import GameBoardOnline from '../components/gameboard/GameBoardOnline.vue'
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