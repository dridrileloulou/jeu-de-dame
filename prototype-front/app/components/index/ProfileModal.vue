<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  user: { type: Object,  default: null  }
})

const emit = defineEmits(['close'])

const { clear } = useUserSession()

function logout() {
  clear()
  emit('close')
}

const stats = ref(null)

watch(() => props.show, async (v) => {
  if (v) {
    try { stats.value = await $fetch('/api/stats') } catch { stats.value = null }
  }
})

const totalPlayed = computed(() => (stats.value?.online?.played ?? 0) + (stats.value?.ia?.played ?? 0))
const totalWins   = computed(() => (stats.value?.online?.wins   ?? 0) + (stats.value?.ia?.wins   ?? 0))
const totalLosses = computed(() => (stats.value?.online?.losses ?? 0) + (stats.value?.ia?.losses ?? 0))
const winRate     = computed(() => totalPlayed.value > 0 ? Math.round(totalWins.value / totalPlayed.value * 100) : 0)

const COLORS = ['#e74c3c','#e67e22','#f39c12','#2ecc71','#1abc9c','#3498db','#9b59b6','#8e44ad']
function nameColor(name) {
  let h = 0
  for (const c of (name ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff
  return COLORS[h % COLORS.length]
}
const avatarColor  = computed(() => nameColor(props.user?.name))
const avatarLetter = computed(() => (props.user?.name ?? '?')[0].toUpperCase())
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content profile-modal">
      <button class="modal-close" @click="emit('close')">✕</button>

      <div class="profile-header">
        <img
          v-if="user?.picture"
          :src="user.picture"
          :alt="user?.name ?? ''"
          class="profile-avatar"
        />
        <div
          v-else
          class="profile-avatar profile-avatar--letter"
          :style="{ background: avatarColor }"
        >{{ avatarLetter }}</div>
        <div>
          <p class="profile-name">{{ user?.name }}</p>
          <p class="profile-email">{{ user?.email }}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <span class="stat-value">{{ totalPlayed }}</span>
          <span class="stat-label">Parties jouées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalWins }}</span>
          <span class="stat-label">Victoires</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ totalLosses }}</span>
          <span class="stat-label">Défaites</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats?.online?.played ?? 0 }}</span>
          <span class="stat-label">En ligne</span>
        </div>
        <div class="stat-card stat-card--wide">
          <span class="stat-value">{{ winRate }}%</span>
          <span class="stat-label">Taux de victoire</span>
        </div>
        <div class="stat-card stat-card--wide">
          <span class="stat-value">{{ user?.elo ?? 1000 }}</span>
          <span class="stat-label">Classement ELO</span>
        </div>
      </div>

      <div class="profile-footer">
        <button class="btn-logout" @click="logout">Déconnexion</button>
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

/* ── PROFILE MODAL ── */
.profile-modal {
  position: relative;
  width: clamp(340px, calc(var(--panel-w) * 1.0), 580px);
  padding: 0;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.18);
  padding: calc(var(--cell) * 0.25) calc(var(--cell) * 0.25) calc(var(--cell) * 0.16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width:  clamp(52px, calc(var(--cell) * 0.75), 82px);
  height: clamp(52px, calc(var(--cell) * 0.75), 82px);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  object-fit: cover;
  flex-shrink: 0;
}

.profile-avatar--letter {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.3rem, calc(var(--cell) * 0.38), 2.2rem);
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  user-select: none;
}

.profile-name {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 600;
}

.profile-email {
  margin: 0.2rem 0 0;
  font-size: calc(var(--fs-base) * 0.85);
  color: rgba(255, 255, 255, 0.45);
}

/* ── STATS PROFIL ── */
.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: calc(var(--cell) * 0.13);
  padding: calc(var(--cell) * 0.22) calc(var(--cell) * 0.25);
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--cell) * 0.16) calc(var(--cell) * 0.1);
  gap: 4px;
}

.stat-card--wide {
  grid-column: span 2;
}

.stat-value {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: calc(var(--fs-base) * 0.78);
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}

/* ── FOOTER ── */
.profile-footer {
  padding: calc(var(--cell) * 0.14) calc(var(--cell) * 0.25) calc(var(--cell) * 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
}

.btn-logout {
  padding: calc(var(--cell) * 0.09) calc(var(--cell) * 0.22);
  background: rgba(255, 80, 80, 0.12);
  color: #ff6b6b;
  border: 1px solid rgba(255, 80, 80, 0.3);
  border-radius: 999px;
  font-size: calc(var(--fs-base) * 0.88);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.btn-logout:hover { background: rgba(255, 80, 80, 0.25); }
</style>
