<script setup>
import { ref } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const bugEmail = ref('')
const bugName = ref('')
const bugDescription = ref('')
const bugSent = ref(false)

async function sendBugReport() {
  // TODO: connecter à l'API
  bugSent.value = true
}

function closeBugModal() {
  emit('close')
  bugSent.value = false
  bugEmail.value = ''
  bugName.value = ''
  bugDescription.value = ''
}
</script>

<template>
  <div v-if="show" class="modal" @click.self="closeBugModal">
    <div class="modal-content bug-modal">
      <button class="modal-close" @click="closeBugModal">✕</button>

      <div v-if="!bugSent">
        <h3>Signaler un bug</h3>

        <div class="form-group">
          <label>E-mail</label>
          <input v-model="bugEmail" type="email" placeholder="exemple@mail.com" />
        </div>

        <div class="form-group">
          <label>Nom (optionnel)</label>
          <input v-model="bugName" type="text" placeholder="" />
        </div>

        <div class="form-group">
          <label>Décrivez le problème</label>
          <textarea v-model="bugDescription" class="bug-textarea" placeholder=""></textarea>
        </div>

        <div class="bug-footer-buttons">
          <button class="btn-bug-cancel" @click="closeBugModal">Fermer</button>
          <button class="btn-bug-send" @click="sendBugReport">Envoyer le rapport</button>
        </div>
      </div>

      <div v-else class="bug-sent">
        <span class="bug-sent-icon">✅</span>
        <p>Merci ! Votre rapport a bien été envoyé.</p>
        <button class="btn-bug-cancel" @click="closeBugModal">Fermer</button>
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
  display: flex;
  flex-direction: column;
  gap: calc(var(--cell) * 0.16);
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

/* ── BUG MODAL ── */
.bug-modal {
  position: relative;
  background: white;
  color: #111;
  width: clamp(340px, calc(var(--panel-w) * 1.0), 560px);
}

.bug-modal h3 {
  color: #111;
  font-size: clamp(1.4rem, calc(var(--cell) * 0.3), 2rem);
}

.bug-modal .modal-close {
  color: rgba(0, 0, 0, 0.35);
}

.bug-modal .modal-close:hover {
  color: #111;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: calc(var(--cell) * 0.16);
}

.bug-modal .form-group label {
  color: #333;
  font-weight: 600;
  font-size: calc(var(--fs-base) * 0.92);
}

.bug-modal .form-group input,
.bug-textarea {
  padding: calc(var(--cell) * 0.1) 0.9rem;
  border-radius: var(--radius);
  border: 1.5px solid #ccc;
  background: white;
  color: #111;
  font-size: var(--fs-base);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.bug-modal .form-group input:focus,
.bug-textarea:focus {
  border-color: #888;
}

.bug-textarea {
  min-height: clamp(100px, calc(var(--cell) * 1.8), 180px);
  resize: vertical;
}

.bug-footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.btn-bug-cancel {
  padding: calc(var(--cell) * 0.1) calc(var(--cell) * 0.22);
  background: #e8e8e8;
  color: #333;
  border: none;
  border-radius: 999px;
  font-size: var(--fs-base);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-bug-cancel:hover { background: #d5d5d5; }

.btn-bug-send {
  padding: calc(var(--cell) * 0.1) calc(var(--cell) * 0.26);
  background: #3b2a1a;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: var(--fs-base);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
}

.btn-bug-send:hover {
  background: #5a4030;
  transform: scale(1.02);
}

.bug-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: calc(var(--cell) * 0.2) 0;
  color: #111;
}

.bug-sent-icon {
  font-size: calc(var(--fs-xl) * 0.9);
}

.bug-sent p {
  margin: 0;
  font-size: var(--fs-base);
  text-align: center;
}
</style>
