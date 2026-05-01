<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const tab        = ref('ongoing')
const ongoing    = ref([])
const history    = ref([])
const loading    = ref(false)
const deletingId = ref(null)

watch(() => props.show, async (v) => {
  if (v) {
    loading.value = true
    try {
      const [g, h] = await Promise.all([
        $fetch('/api/local-games'),
        $fetch('/api/history')
      ])
      ongoing.value = g
      history.value = h
    } catch {
      ongoing.value = []
      history.value = []
    }
    loading.value = false
  }
})

async function deleteGame(id) {
  deletingId.value = id
  try {
    await $fetch(`/api/local-games/${id}`, { method: 'DELETE' })
    ongoing.value = ongoing.value.filter(g => g._id !== id)
  } catch {}
  deletingId.value = null
}

const MODE_LABEL  = { ia: 'vs IA', online: 'En ligne', local: 'Local' }
const MODE_ICON   = { ia: '🤖', online: '🌐', local: '👥' }
const REASON_LABEL = {
  no_pieces:  'Plus de pions',
  no_moves:   'Plus de mouvements',
  time:       'Temps écoulé',
  resign:     'Abandon',
  disconnect: 'Déconnexion'
}
const LEVEL_LABEL = { facile: 'Facile', normale: 'Normale', difficile: 'Difficile' }

function opponentLabel(game) {
  if (game.mode === 'ia') return `IA ${LEVEL_LABEL[game.opponent] ?? game.opponent ?? ''}`
  return game.opponent || 'Adversaire'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDatetime(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content saved-modal">
      <button class="modal-close" @click="emit('close')">✕</button>
      <h3>🕹 Mes parties</h3>

      <!-- Onglets -->
      <div class="tabs">
        <button :class="['tab', { active: tab === 'ongoing' }]" @click="tab = 'ongoing'">
          En cours
          <span v-if="ongoing.length > 0" class="tab-badge">{{ ongoing.length }}</span>
        </button>
        <button :class="['tab', { active: tab === 'history' }]" @click="tab = 'history'">Historique</button>
      </div>

      <div v-if="loading" class="empty-state">Chargement…</div>

      <!-- Onglet EN COURS -->
      <template v-else-if="tab === 'ongoing'">
        <div v-if="ongoing.length === 0" class="empty-state">Aucune partie en cours sauvegardée.</div>
        <ul v-else class="game-list">
          <li v-for="g in ongoing" :key="g._id" class="game-item">
            <div class="ongoing-info">
              <span class="ongoing-icon">👥</span>
              <div class="ongoing-names">
                <span class="ongoing-title">{{ g.whiteName }} vs {{ g.blackName }}</span>
                <span class="ongoing-meta">
                  Tour : <strong>{{ g.currentPlayer === 'white' ? g.whiteName : g.blackName }}</strong>
                  · {{ formatDatetime(g.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="ongoing-actions">
              <NuxtLink
                :to="`/jeu-offline?resume=${g._id}`"
                class="btn-resume"
                @click="emit('close')"
              >▶ Reprendre</NuxtLink>
              <button
                class="btn-delete"
                :disabled="deletingId === g._id"
                @click="deleteGame(g._id)"
              >✕</button>
            </div>
          </li>
        </ul>
      </template>

      <!-- Onglet HISTORIQUE -->
      <template v-else>
        <div v-if="history.length === 0" class="empty-state">Aucune partie jouée.</div>
        <ul v-else class="game-list">
          <li v-for="(g, i) in history" :key="i" class="game-item">
            <template v-if="g.mode === 'local'">
              <span class="result-badge local">🏆 {{ g.result }}</span>
            </template>
            <template v-else>
              <span class="result-badge" :class="g.result === 'win' ? 'win' : 'loss'">
                {{ g.result === 'win' ? 'Victoire' : 'Défaite' }}
              </span>
            </template>
            <div class="game-info">
              <span class="game-mode">{{ MODE_ICON[g.mode] }} {{ MODE_LABEL[g.mode] }}</span>
              <span class="game-opponent">
                {{ g.mode === 'local' ? `${g.result} vs ${g.opponent}` : opponentLabel(g) }}
              </span>
              <span v-if="g.reason" class="game-reason">{{ REASON_LABEL[g.reason] ?? g.reason }}</span>
            </div>
            <span class="game-date">{{ formatDate(g.date) }}</span>
          </li>
        </ul>
      </template>

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
  color: rgba(255,255,255,0.5);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}
.modal-close:hover { color: white; }

/* ── SAVED MODAL ── */
.saved-modal {
  position: relative;
  width: clamp(320px, calc(var(--panel-w) * 1.2), 600px);
}

.empty-state {
  margin: 0;
  color: rgba(255,255,255,0.35);
  font-size: var(--fs-base);
  text-align: center;
  padding: calc(var(--cell) * 0.29) 0;
}

/* ── TABS ── */
.tabs {
  display: flex;
  background: rgba(255,255,255,0.06);
  border-radius: calc(var(--radius) * 0.8);
  padding: 3px;
  gap: 3px;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: calc(var(--cell) * 0.09) calc(var(--cell) * 0.14);
  border-radius: calc(var(--radius) * 0.6);
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.45);
  font-size: calc(var(--fs-base) * 0.9);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
}
.tab:hover { color: white; }
.tab.active {
  background: rgba(255,255,255,0.14);
  color: white;
  font-weight: 700;
}

.tab-badge {
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  font-size: calc(var(--fs-base) * 0.72);
  font-weight: 700;
  padding: 1px 7px;
  line-height: 1.4;
}
.tab.active .tab-badge { background: rgba(255,255,255,0.3); }

/* ── LIST ── */
.game-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--cell) * 0.1);
  max-height: clamp(240px, 50dvh, 380px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

.game-item {
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.14);
  padding: calc(var(--cell) * 0.12) calc(var(--cell) * 0.16);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius);
  min-width: 0;
}

/* ── EN COURS ── */
.ongoing-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.12);
  min-width: 0;
}

.ongoing-icon { font-size: var(--fs-lg); flex-shrink: 0; }

.ongoing-names {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ongoing-title {
  font-size: var(--fs-base);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ongoing-meta {
  font-size: calc(var(--fs-base) * 0.78);
  color: rgba(255,255,255,0.4);
}

.ongoing-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.btn-resume {
  padding: calc(var(--cell) * 0.07) calc(var(--cell) * 0.16);
  background: rgba(46,213,115,0.15);
  border: 1px solid rgba(46,213,115,0.35);
  color: #2ed573;
  border-radius: 999px;
  font-size: calc(var(--fs-base) * 0.82);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s;
}
.btn-resume:hover { background: rgba(46,213,115,0.28); }

.btn-delete {
  background: none;
  border: none;
  color: rgba(255,255,255,0.25);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s;
  line-height: 1;
}
.btn-delete:hover:not(:disabled) { color: #ff6b6b; }
.btn-delete:disabled { opacity: 0.3; }

/* ── HISTORIQUE ── */
.result-badge {
  flex-shrink: 0;
  font-size: calc(var(--fs-base) * 0.82);
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.result-badge.win   { background: rgba(46,213,115,0.18);  color: #2ed573; border: 1px solid rgba(46,213,115,0.35); }
.result-badge.loss  { background: rgba(255,107,107,0.18); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.35); }
.result-badge.local { background: rgba(255,215,0,0.15);   color: #ffd700; border: 1px solid rgba(255,215,0,0.35); }

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.game-mode     { font-size: calc(var(--fs-base) * 0.78); color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.game-opponent { font-size: var(--fs-base); font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-reason   { font-size: calc(var(--fs-base) * 0.8); color: rgba(255,255,255,0.35); }
.game-date     { flex-shrink: 0; font-size: calc(var(--fs-base) * 0.8); color: rgba(255,255,255,0.35); }
</style>
