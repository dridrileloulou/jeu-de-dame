<script setup>
const emit = defineEmits(['openRules', 'openBug'])
</script>

<template>
  <footer class="footer-bar">
    <span class="footer-copy">© 2025 Dam'eirb.fr</span>
    <div class="footer-buttons">
      <button class="btn-mode btn-footer" @click="emit('openRules')">
        <span class="btn-icon">📖</span>
        Règles
      </button>
      <button class="btn-mode btn-footer" @click="emit('openBug')">
        <span class="btn-icon">✉</span>
        Signaler un bug
      </button>
    </div>
  </footer>
</template>

<style scoped>
/* ── FOOTER ── */
.footer-bar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem var(--pad-h);
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0, 0, 0, 0.4);
  font-size: calc(var(--fs-base) * 0.82);
  color: rgba(255, 255, 255, 0.55);
}

.footer-copy {
  white-space: nowrap;
}

.footer-buttons {
  display: flex;
  gap: calc(var(--gap) * 0.6);
}

.btn-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--cell) * 0.15);
  padding: calc(var(--cell) * 0.15) calc(var(--cell) * 0.25);
  background: #b0b0b0;
  color: black;
  text-decoration: none;
  border-radius: var(--radius);
  font-size: var(--fs-lg);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  font-weight: 500;
}

.btn-mode:hover {
  background: #c8c8c8;
  transform: scale(1.04);
}

.btn-icon {
  font-size: calc(var(--fs-lg) * 1.15);
}

.btn-footer {
  padding: calc(var(--cell) * 0.09) calc(var(--cell) * 0.18);
  font-size: var(--fs-base);
}
</style>
