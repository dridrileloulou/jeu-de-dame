<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal-content profile-modal">
      <button class="modal-close" @click="emit('close')">✕</button>

      <div class="profile-header">
        <img
          :src="user?.picture ?? user?.avatar_url ?? ''"
          :alt="user?.name ?? ''"
          class="profile-avatar"
        />
        <div>
          <p class="profile-name">{{ user?.name }}</p>
          <p class="profile-email">{{ user?.email }}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <span class="stat-value">—</span>
          <span class="stat-label">Parties jouées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">—</span>
          <span class="stat-label">Victoires</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">—</span>
          <span class="stat-label">Défaites</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">—</span>
          <span class="stat-label">Nuls</span>
        </div>
        <div class="stat-card stat-card--wide">
          <span class="stat-value">—%</span>
          <span class="stat-label">Taux de victoire</span>
        </div>
        <div class="stat-card stat-card--wide">
          <span class="stat-value">—</span>
          <span class="stat-label">Classement ELO</span>
        </div>
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
</style>
