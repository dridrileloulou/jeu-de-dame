<template>
  <div class="player-turn">
    <div class="turn-info">
      <span class="label">Tour:</span>
      <div class="player-indicator" :class="currentPlayer">
        {{ currentPlayer === 'white' ? 'Blanc' : 'Noir' }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentPlayer: {
    type: String,
    default: 'white'
  }
})
</script>

<style scoped>
.player-turn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.turn-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.label {
  color: #ccc;
}

.player-indicator {
  padding: 12px 20px;
  border-radius: 8px;
  min-width: 140px;
  text-align: center;
  transition: all 0.3s ease;
  font-size: 20px;
  font-weight: bold;
}

.player-indicator.white {
  background-color: #f5deb3;
  color: #000;
  box-shadow: 0 0 10px rgba(245, 222, 179, 0.5);
}

.player-indicator.black {
  background-color: #555;
  color: #fff;
  box-shadow: 0 0 10px rgba(85, 85, 85, 0.5);
}
</style>
