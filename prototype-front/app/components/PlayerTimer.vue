<template>
  <div class="timer-box" :class="{ active: isActive }">
    <div class="timer-text">{{ formattedTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeRemaining: {
    type: Number,
    default: 600
  },
  color: {
    type: String,
    default: 'white'
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60).toString().padStart(2, '0')
  const seconds = (props.timeRemaining % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})
</script>

<style scoped>
.timer-box {
  padding: 10px 16px;
  border-radius: 6px;
  background: rgba(100, 100, 100, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.timer-text {
  font-size: 1.2rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #ccc;
  text-align: center;
  min-width: 70px;
}

.timer-box.active {
  background: rgba(255, 34, 0, 0.3);
  border-color: #ff2200;
  animation: pulse 1s ease-in-out infinite;
}

.timer-box.active .timer-text {
  color: #ff2200;
  text-shadow: 0 0 8px #ff2200;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
</style>
