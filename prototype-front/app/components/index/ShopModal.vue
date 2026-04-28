<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content shop-modal">
      <button class="modal-close" @click="emit('close')">✕</button>
      <h3>🛒 Boutique</h3>
      <p class="empty-state" style="padding-top: 1rem;">Bientôt disponible.</p>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal-content {
  background: #222;
  padding: calc(var(--cell) * 0.29);
  border-radius: calc(var(--radius) * 1.2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--cell) * 0.16);
}

.modal-content h3 {
  margin: 0;
  text-align: center;
  font-size: var(--fs-lg);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.modal-close:hover { color: white; }

/* ── SHOP MODAL ── */
.shop-modal {
  position: relative;
  width: clamp(320px, calc(var(--panel-w) * 0.9), 520px);
}

.empty-state {
  margin: 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: var(--fs-base);
  text-align: center;
  padding-top: calc(var(--cell) * 0.29);
}
</style>
