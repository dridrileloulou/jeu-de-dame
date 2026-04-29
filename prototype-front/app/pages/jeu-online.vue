<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameBar from '../components/GameBar.vue'
import GameBoardOnline from '../components/gameboard/GameBoardOnline.vue'

const route  = useRoute()
const router = useRouter()
const { loggedIn, user } = useUserSession()

const code = computed(() => route.query.code?.toString().toUpperCase() ?? null)

// ── Onglets ───────────────────────────────────────────────────────────────
const tab = ref('create') // 'create' | 'join'

// ── Créer ─────────────────────────────────────────────────────────────────
const createTimer  = ref('none')
const createCustom = ref(5)
const createColor  = ref('random')
const creating     = ref(false)
const createError  = ref('')

async function createGame() {
  creating.value = true
  createError.value = ''
  try {
    const res = await $fetch('/api/game/create', {
      method: 'POST',
      body: {
        timer: createTimer.value,
        customSeconds: createTimer.value === 'custom' ? createCustom.value * 60 : undefined,
        creatorColor: createColor.value
      }
    })
    router.push({ path: '/jeu-online', query: { code: res.code } })
  } catch (e) {
    createError.value = e?.data?.message || 'Erreur lors de la création.'
    creating.value = false
  }
}

// ── Rejoindre ─────────────────────────────────────────────────────────────
const joinCode  = ref('')
const joining   = ref(false)
const joinError = ref('')

async function joinGame() {
  joining.value = true
  joinError.value = ''
  try {
    const res = await $fetch('/api/game/join', {
      method: 'POST',
      body: { code: joinCode.value.toUpperCase() }
    })
    router.push({ path: '/jeu-online', query: { code: res.code } })
  } catch (e) {
    joinError.value = e?.data?.message || 'Partie introuvable.'
    joining.value = false
  }
}
</script>

<template>
  <div class="page">
    <GameBar v-if="!code" title="Jouer en ligne" />
    <GameBar v-else title="Partie en ligne" />

    <!-- ── Plateau en cours ────────────────────────────────────────────── -->
    <GameBoardOnline
      v-if="code"
      :code="code"
      :user-id="user?.id ?? ''"
      :user-name="user?.name ?? 'Joueur'"
    />

    <!-- ── Lobby ──────────────────────────────────────────────────────── -->
    <div v-else class="backdrop">

      <!-- Non connecté -->
      <div v-if="!loggedIn" class="modal">
        <NuxtLink to="/" class="modal-close">✕</NuxtLink>
        <h2 class="modal-title">🌐 Jouer en ligne</h2>
        <p class="not-logged">Tu dois être connecté pour jouer en ligne.</p>
        <NuxtLink to="/" class="btn-launch">← Retour à l'accueil</NuxtLink>
      </div>

      <!-- Connecté -->
      <div v-else class="modal">
        <NuxtLink to="/" class="modal-close">✕</NuxtLink>
        <h2 class="modal-title">🌐 Jouer en ligne</h2>

        <!-- Onglets -->
        <div class="tabs">
          <button :class="['tab', { active: tab === 'create' }]" @click="tab = 'create'">Créer une partie</button>
          <button :class="['tab', { active: tab === 'join'   }]" @click="tab = 'join'">Rejoindre</button>
        </div>

        <!-- ── Créer ── -->
        <template v-if="tab === 'create'">
          <div class="field">
            <span class="field-label">Temps par joueur</span>
            <div class="btn-group">
              <button
                v-for="opt in [{ v:'none',l:'♾ Sans' },{ v:'5min',l:'5 min' },{ v:'10min',l:'10 min' },{ v:'custom',l:'Perso' }]"
                :key="opt.v"
                :class="['pill', { active: createTimer === opt.v }]"
                @click="createTimer = opt.v"
              >{{ opt.l }}</button>
            </div>
            <div v-if="createTimer === 'custom'" class="custom-row">
              <input v-model.number="createCustom" type="number" min="1" max="60" class="num-input" />
              <span class="num-label">minutes</span>
            </div>
          </div>

          <div class="field">
            <span class="field-label">Ma couleur</span>
            <div class="btn-group">
              <button
                v-for="opt in [{ v:'random',l:'🎲 Aléatoire' },{ v:'white',l:'⬜ Blanc' },{ v:'black',l:'⬛ Noir' }]"
                :key="opt.v"
                :class="['pill', { active: createColor === opt.v }]"
                @click="createColor = opt.v"
              >{{ opt.l }}</button>
            </div>
          </div>

          <p v-if="createError" class="err">{{ createError }}</p>
          <button class="btn-launch" :disabled="creating" @click="createGame">
            {{ creating ? 'Création…' : 'Créer la partie →' }}
          </button>
        </template>

        <!-- ── Rejoindre ── -->
        <template v-else>
          <div class="field">
            <span class="field-label">Code de la partie</span>
            <input
              v-model="joinCode"
              type="text"
              maxlength="6"
              placeholder="EX : AB3C9Z"
              class="code-input"
              @keyup.enter="joinGame"
            />
          </div>

          <p v-if="joinError" class="err">{{ joinError }}</p>
          <button class="btn-launch" :disabled="joining || joinCode.length < 3" @click="joinGame">
            {{ joining ? 'Connexion…' : 'Rejoindre →' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
body { overflow: hidden; }
</style>

<style scoped>
.page {
  min-height: 100vh;
  background: #abaaaa;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  color: white;
}

/* ── Backdrop ── */
.backdrop {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* ── Modal ── */
.modal {
  position: relative;
  background: #222;
  border-radius: 18px;
  padding: 2.4rem 2.8rem;
  width: min(480px, 92vw);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.08);
}

.modal-close {
  position: absolute;
  top: 1.1rem;
  right: 1.2rem;
  color: rgba(255,255,255,0.35);
  font-size: 1.1rem;
  text-decoration: none;
  line-height: 1;
  transition: color 0.2s;
}
.modal-close:hover { color: white; }

.modal-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.not-logged {
  margin: 0;
  color: rgba(255,255,255,0.55);
  font-size: 0.92rem;
}

/* ── Onglets ── */
.tabs {
  display: flex;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}

.tab {
  flex: 1;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.tab:hover  { color: white; }
.tab.active {
  background: rgba(255,255,255,0.14);
  color: white;
  font-weight: 700;
}

/* ── Champs ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255,255,255,0.45);
}

.btn-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pill {
  flex: 1;
  min-width: 72px;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
  font-size: 0.87rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  text-align: center;
}
.pill:hover { background: rgba(255,255,255,0.13); color: white; }
.pill.active {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.55);
  color: white;
  font-weight: 600;
}

.custom-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.num-input {
  width: 72px;
  padding: 0.42rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: white;
  font-size: 0.95rem;
  outline: none;
}

.num-label { color: rgba(255,255,255,0.5); font-size: 0.9rem; }

.code-input {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.07);
  color: white;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  outline: none;
  text-align: center;
  transition: border-color 0.2s;
}
.code-input:focus { border-color: rgba(255,255,255,0.5); }
.code-input::placeholder { color: rgba(255,255,255,0.2); font-size: 1rem; letter-spacing: 0.1em; }

/* ── Bouton ── */
.btn-launch {
  margin-top: 0.4rem;
  padding: 0.78rem 1.4rem;
  border-radius: 12px;
  border: none;
  background: #b0b0b0;
  color: #111;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
  text-align: center;
}
.btn-launch:hover:not(:disabled) { background: #c8c8c8; transform: scale(1.02); }
.btn-launch:disabled { opacity: 0.45; cursor: not-allowed; }

.err {
  color: #ff6b6b;
  font-size: 0.88rem;
  margin: -0.5rem 0 0;
}
</style>
