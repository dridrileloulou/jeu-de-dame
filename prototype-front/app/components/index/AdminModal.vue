<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const { user } = useUserSession()
const isPrincipalAdmin = computed(() => user.value?.name === 'admin')

const users = ref([])
const pending = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const togglingId = ref(null)

async function fetchUsers() {
  pending.value = true
  errorMsg.value = ''
  try {
    const data = await $fetch('/api/admin/users')
    users.value = data.users ?? []
  } catch (e) {
    errorMsg.value = e?.data?.message ?? 'Erreur de chargement'
  } finally {
    pending.value = false
  }
}

watch(() => props.show, (v) => { if (v) fetchUsers() })

async function toggleAdmin(u) {
  const newValue = !u.isAdmin
  if (!newValue && !isPrincipalAdmin.value) {
    errorMsg.value = "Seul l'administrateur principal peut révoquer les droits admin"
    setTimeout(() => errorMsg.value = '', 3000)
    return
  }
  togglingId.value = u._id
  errorMsg.value = ''
  try {
    await $fetch(`/api/admin/users/${u._id}/admin`, {
      method: 'PATCH',
      body: { isAdmin: newValue }
    })
    successMsg.value = newValue
      ? `${u.name} est maintenant administrateur`
      : `Les droits admin de ${u.name} ont été révoqués`
    setTimeout(() => successMsg.value = '', 3000)
    await fetchUsers()
  } catch (e) {
    errorMsg.value = e?.data?.message ?? 'Erreur lors de la mise à jour'
    setTimeout(() => errorMsg.value = '', 3000)
  } finally {
    togglingId.value = null
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-panel">

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span class="admin-badge">ADMIN</span>
          <h2>Gestion des utilisateurs</h2>
        </div>
        <div class="modal-header-right">
          <span class="user-count">{{ users.length }} utilisateur{{ users.length > 1 ? 's' : '' }}</span>
          <button class="btn-refresh" @click="fetchUsers" :disabled="pending">↻</button>
          <button class="btn-close" @click="emit('close')">✕</button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="errorMsg" class="msg msg-error">{{ errorMsg }}</div>
      <div v-if="successMsg" class="msg msg-success">{{ successMsg }}</div>

      <!-- Corps -->
      <div class="modal-body">
        <div v-if="pending" class="loading">Chargement…</div>

        <div v-else-if="users.length === 0" class="empty">Aucun utilisateur inscrit.</div>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>ELO</th>
                <th>Méthode</th>
                <th>Inscrit le</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u._id" :class="{ 'row-admin': u.isAdmin }">
                <!-- Utilisateur -->
                <td class="td-user">
                  <div class="user-cell">
                    <img v-if="u.picture" :src="u.picture" :alt="u.name" class="avatar" />
                    <div v-else class="avatar-placeholder">{{ u.name?.[0]?.toUpperCase() }}</div>
                    <span class="user-name">{{ u.name }}</span>
                  </div>
                </td>

                <!-- Email -->
                <td class="td-email">{{ u.email }}</td>

                <!-- ELO -->
                <td class="td-elo">{{ u.elo ?? 1000 }}</td>

                <!-- Méthode -->
                <td>
                  <span :class="['badge', u.googleId ? 'badge-google' : 'badge-email']">
                    {{ u.googleId ? 'Google' : 'Email' }}
                  </span>
                </td>

                <!-- Date -->
                <td class="td-date">{{ formatDate(u.createdAt) }}</td>

                <!-- Statut admin -->
                <td class="td-status">
                  <span v-if="u.isAdmin" class="badge badge-admin">Admin</span>
                  <span v-else class="no-status">—</span>
                </td>

                <!-- Action -->
                <td class="td-action">
                  <!-- L'admin principal est protégé, pas de bouton -->
                  <span v-if="u.name === 'admin'" class="protected-label">Protégé</span>

                  <!-- Révoquer : uniquement pour l'admin principal sur les autres admins -->
                  <button
                    v-else-if="u.isAdmin && isPrincipalAdmin"
                    class="btn-toggle btn-revoke"
                    :disabled="togglingId === u._id"
                    @click="toggleAdmin(u)"
                  >
                    {{ togglingId === u._id ? '…' : 'Révoquer' }}
                  </button>

                  <!-- Promouvoir : tous les admins peuvent promouvoir -->
                  <button
                    v-else-if="!u.isAdmin"
                    class="btn-toggle btn-grant"
                    :disabled="togglingId === u._id"
                    @click="toggleAdmin(u)"
                  >
                    {{ togglingId === u._id ? '…' : 'Promouvoir' }}
                  </button>

                  <!-- Admin non-principal voit le badge mais pas de bouton de révocation -->
                  <span v-else class="no-status">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1.5rem;
}

.modal-panel {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 920px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
  color: #e0e0e0;
}

/* ── Header ─────────────────────────────────────────────────── */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.modal-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.admin-badge {
  background: #e63946;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.08em;
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.user-count {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.btn-refresh, .btn-close {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.btn-refresh:hover:not(:disabled), .btn-close:hover {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.btn-refresh:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Messages ────────────────────────────────────────────────── */
.msg {
  padding: 0.6rem 1.5rem;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.msg-error   { background: rgba(230, 57, 70, 0.15); color: #e63946; border-bottom: 1px solid rgba(230,57,70,0.2); }
.msg-success { background: rgba(72, 187, 120, 0.12); color: #48bb78; border-bottom: 1px solid rgba(72,187,120,0.2); }

/* ── Corps ───────────────────────────────────────────────────── */
.modal-body {
  flex: 1;
  overflow-y: auto;
}

.loading, .empty {
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
}

.table-wrapper { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead th {
  text-align: left;
  padding: 0.7rem 1rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255, 255, 255, 0.38);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

tbody tr:last-child { border-bottom: none; }
tbody tr:hover      { background: rgba(255, 255, 255, 0.03); }
tbody tr.row-admin  { background: rgba(230, 57, 70, 0.04); }

td { padding: 0.65rem 1rem; vertical-align: middle; }

/* ── Cellules ────────────────────────────────────────────────── */
.td-user { min-width: 160px; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0f3460;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  color: #7eb8f7;
  flex-shrink: 0;
}

.user-name  { font-weight: 600; }
.td-email   { color: rgba(255, 255, 255, 0.5); font-size: 0.82rem; }
.td-elo     { font-weight: 600; color: #f4a261; }
.td-date    { color: rgba(255, 255, 255, 0.4); font-size: 0.82rem; white-space: nowrap; }
.td-status  { white-space: nowrap; }
.td-action  { white-space: nowrap; }
.no-status  { color: rgba(255, 255, 255, 0.18); }

/* ── Badges ──────────────────────────────────────────────────── */
.badge {
  display: inline-block;
  padding: 0.18rem 0.55rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-google { background: rgba(66,133,244,0.18); color: #7eb8f7; }
.badge-email  { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.55); }
.badge-admin  { background: rgba(230,57,70,0.18); color: #e63946; }

.protected-label {
  font-size: 0.75rem;
  color: rgba(255, 215, 0, 0.5);
  font-style: italic;
}

/* ── Boutons action ──────────────────────────────────────────── */
.btn-toggle {
  padding: 0.28rem 0.7rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
}

.btn-toggle:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-grant {
  background: rgba(72, 187, 120, 0.15);
  color: #48bb78;
  border: 1px solid rgba(72, 187, 120, 0.3);
}
.btn-grant:hover:not(:disabled) { background: rgba(72, 187, 120, 0.3); }

.btn-revoke {
  background: rgba(230, 57, 70, 0.12);
  color: #e63946;
  border: 1px solid rgba(230, 57, 70, 0.28);
}
.btn-revoke:hover:not(:disabled) { background: rgba(230, 57, 70, 0.25); }
</style>
