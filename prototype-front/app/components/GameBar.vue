<template>
  <div class="game-bar">
    <NuxtLink to="/" class="back-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      <span class="back-label">Accueil</span>
    </NuxtLink>
    <span class="bar-title">{{ title }}</span>
    <div class="bar-action"><slot /></div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<style scoped>
.game-bar {
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
  gap: 1rem;
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: color 0.15s;
  white-space: nowrap;
}
.back-btn:hover { color: white; }

.bar-title {
  flex: 1;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  pointer-events: none;
}

.bar-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  justify-content: flex-end;
}

@media (max-width: 400px) {
  .back-label { display: none; }
  .bar-title { font-size: 0.75rem; }
}
</style>
