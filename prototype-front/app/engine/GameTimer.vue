<template>
  <div class="clock">
    ⏱ {{ formattedTime }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const seconds = ref(0)
let interval = null

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60).toString().padStart(2, '0')
  const s = (seconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

onMounted(() => { interval = setInterval(() => seconds.value++, 1000) })
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.clock {
  font-size: 4rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #ff2200;
  background: #111;
  padding: 20px 40px;
  border-radius: 12px;
  border: 3px solid #ff2200;
  box-shadow: 0 0 15px #ff2200, 0 0 40px rgba(255, 34, 0, 0.4);
  text-shadow: 0 0 10px #ff2200;
}
</style>