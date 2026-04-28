<script setup>
import { ref } from 'vue'

defineProps({ show: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const { fetch: fetchSession } = useUserSession()

const mode = ref('login')
const error = ref('')
const loading = ref(false)

const loginEmail    = ref('')
const loginPassword = ref('')

const regName     = ref('')
const regEmail    = ref('')
const regPassword = ref('')

function loginWithGoogle() {
  window.location.href = '/auth/google'
}

async function loginWithCredentials() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: loginEmail.value, password: loginPassword.value }
    })
    await fetchSession()
    emit('close')
  } catch (e) {
    error.value = e?.data?.message || 'Identifiants incorrects.'
  } finally {
    loading.value = false
  }
}

async function registerWithCredentials() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: regName.value, email: regEmail.value, password: regPassword.value }
    })
    await fetchSession()
    emit('close')
  } catch (e) {
    error.value = e?.data?.message || 'Erreur lors de l\'inscription.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content auth-modal">
      <button class="modal-close" @click="emit('close')">✕</button>
      <h3>{{ mode === 'login' ? 'Connexion' : 'Inscription' }}</h3>

      <!-- Google -->
      <button class="btn-google" @click="loginWithGoogle">
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </button>

      <div class="separator"><span>ou</span></div>

      <!-- Formulaire login -->
      <template v-if="mode === 'login'">
        <div class="form-group">
          <label>Email ou identifiant</label>
          <input v-model="loginEmail" type="text" placeholder="exemple@mail.com ou admin" @keyup.enter="loginWithCredentials" />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="loginPassword" type="password" placeholder="••••••••" @keyup.enter="loginWithCredentials" />
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button class="btn-grey full-width" :disabled="loading" @click="loginWithCredentials">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
        <p class="switch-mode">
          Pas encore de compte ?
          <button class="link-btn" @click="mode = 'register'; error = ''">S'inscrire</button>
        </p>
      </template>

      <!-- Formulaire register -->
      <template v-else>
        <div class="form-group">
          <label>Pseudo</label>
          <input v-model="regName" type="text" placeholder="MonPseudo" @keyup.enter="registerWithCredentials" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="regEmail" type="email" placeholder="exemple@mail.com" @keyup.enter="registerWithCredentials" />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="regPassword" type="password" placeholder="6 caractères min." @keyup.enter="registerWithCredentials" />
        </div>
        <p v-if="error" class="login-error">{{ error }}</p>
        <button class="btn-grey full-width" :disabled="loading" @click="registerWithCredentials">
          {{ loading ? 'Inscription…' : 'Créer mon compte' }}
        </button>
        <p class="switch-mode">
          Déjà un compte ?
          <button class="link-btn" @click="mode = 'login'; error = ''">Se connecter</button>
        </p>
      </template>
    </div>

    <NuxtLink to="/regles" class="rules-link" @click="emit('close')">📖 Règles du Jeu</NuxtLink>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  gap: 1rem;
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

.auth-modal {
  position: relative;
  width: clamp(320px, calc(var(--panel-w) * 0.9), 520px);
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: calc(var(--cell) * 0.115) 1.2rem;
  background: white;
  color: #444;
  font-size: var(--fs-base);
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.btn-google:hover {
  background: #f0f0f0;
  transform: scale(1.02);
}

.google-icon { width: 22px; height: 22px; flex-shrink: 0; }

.separator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  font-size: calc(var(--fs-base) * 0.88);
  color: rgba(255, 255, 255, 0.7);
}

.form-group input {
  padding: calc(var(--cell) * 0.09) 0.9rem;
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: var(--fs-base);
  outline: none;
  transition: border-color 0.2s;
}

.form-group input::placeholder { color: rgba(255, 255, 255, 0.3); }
.form-group input:focus { border-color: rgba(255, 255, 255, 0.5); }

.login-error {
  color: #ff6b6b;
  font-size: calc(var(--fs-base) * 0.88);
  margin: 0;
  text-align: center;
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

.btn-grey:hover:not(:disabled) {
  background: #b5b5b5;
  transform: scale(1.04);
}

.btn-grey:disabled { opacity: 0.6; cursor: not-allowed; }

.full-width { width: 100%; }

.switch-mode {
  text-align: center;
  font-size: calc(var(--fs-base) * 0.88);
  color: rgba(255,255,255,0.6);
  margin: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #7eb8f7;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
  padding: 0;
}

.link-btn:hover { color: #a8d0ff; }

.rules-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.rules-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}
</style>
