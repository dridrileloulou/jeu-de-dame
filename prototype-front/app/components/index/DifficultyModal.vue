<script setup>
import { ref } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'close'])

const difficulty = ref('normal')
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content">
      <h3>Niveau de difficulté</h3>
      <select v-model="difficulty">
        <option value="facile">Facile</option>
        <option value="normal">Normale</option>
        <option value="difficile">Difficile</option>
        <option value="expert">Expert</option>
      </select>
      <div class="modal-buttons">
        <button class="btn-grey" @click="emit('confirm', difficulty)">Lancer la partie</button>
        <button class="btn-cancel" @click="emit('close')">Annuler</button>
      </div>
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
  width: clamp(300px, calc(var(--panel-w) * 0.85), 480px);
  display: flex;
  flex-direction: column;
  gap: calc(var(--cell) * 0.16);
}

.modal-content h3 {
  margin: 0;
  text-align: center;
  font-size: var(--fs-lg);
}

.modal-content select {
  padding: calc(var(--cell) * 0.1);
  border-radius: var(--radius);
  border: none;
  font-size: var(--fs-base);
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 0.3rem;
}

.btn-grey {
  padding: calc(var(--cell) * 0.15) calc(var(--cell) * 0.25);
  background: #9c9c9c;
  color: black;
  border-radius: var(--radius);
  font-size: var(--fs-lg);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  font-weight: 500;
}

.btn-grey:hover {
  background: #b5b5b5;
  transform: scale(1.04);
}

.btn-cancel {
  background: #444;
  color: white;
  padding: calc(var(--cell) * 0.115) calc(var(--cell) * 0.21);
  border-radius: var(--radius);
  font-size: var(--fs-base);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-cancel:hover { background: #555; }
</style>
