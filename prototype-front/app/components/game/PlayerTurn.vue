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
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.label {
  color: rgba(255,255,255,0.6);
}

/* bouton du tour */
.player-indicator {
  padding: 14px 26px;
  border-radius: 12px;
  min-width: 150px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  transition: all 0.25s ease;
}

/* TOUR BLANC */
.player-indicator.white {
  background: #b0b0b0;
  color: #262626;
  border: 1px solid rgba(0,0,0,0.5);
}

/* TOUR NOIR */
.player-indicator.black {
  background: #262626;
  color: #b0b0b0;
  border: 1px solid rgba(255,255,255,0.2);
}
</style>
