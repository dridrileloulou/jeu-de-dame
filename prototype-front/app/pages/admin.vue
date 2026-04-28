<script setup>
definePageMeta({ middleware: 'admin' })

const { user } = useUserSession()
const { data, pending, refresh } = await useFetch('/api/admin/users')
const users = computed(() => data.value?.users ?? [])

function loginMethod(u) {
  if (u.googleId) return 'Google'
  if (u.password !== undefined) return 'Email'
  return '—'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="admin-title">
        <span class="admin-badge">ADMIN</span>
        <h1>Tableau de bord</h1>
      </div>
      <div class="admin-meta">
        Connecté en tant que <strong>{{ user?.name }}</strong>
        <NuxtLink to="/" class="btn-back">← Retour au jeu</NuxtLink>
      </div>
    </header>

    <main class="admin-main">
      <div class="card">
        <div class="card-head">
          <h2>Utilisateurs <span class="count">{{ users.length }}</span></h2>
          <button class="btn-refresh" @click="refresh">↻ Actualiser</button>
        </div>

        <div v-if="pending" class="loading">Chargement…</div>

        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Email</th>
                <th>ELO</th>
                <th>Méthode</th>
                <th>Admin</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u._id">
                <td class="td-avatar">
                  <img v-if="u.picture" :src="u.picture" :alt="u.name" class="avatar" />
                  <div v-else class="avatar-placeholder">{{ u.name?.[0]?.toUpperCase() }}</div>
                </td>
                <td class="td-name">{{ u.name }}</td>
                <td class="td-email">{{ u.email }}</td>
                <td class="td-elo">{{ u.elo ?? 1000 }}</td>
                <td>
                  <span :class="['badge', u.googleId ? 'badge-google' : 'badge-email']">
                    {{ u.googleId ? 'Google' : 'Email' }}
                  </span>
                </td>
                <td class="td-center">
                  <span v-if="u.isAdmin" class="badge badge-admin">✓</span>
                  <span v-else class="td-no">—</span>
                </td>
                <td class="td-date">{{ formatDate(u.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="users.length === 0" class="empty">Aucun utilisateur inscrit.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100dvh;
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: Arial, sans-serif;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2rem;
  background: #16213e;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.admin-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.admin-title h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.admin-badge {
  background: #e63946;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.08em;
}

.admin-meta {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
}

.btn-back {
  color: #7eb8f7;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(126,184,247,0.3);
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-back:hover { background: rgba(126,184,247,0.1); }

.admin-main {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.card {
  background: #16213e;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  overflow: hidden;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.card-head h2 {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.count {
  background: rgba(255,255,255,0.1);
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-weight: 400;
}

.btn-refresh {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-refresh:hover { background: rgba(255,255,255,0.13); }

.loading {
  padding: 3rem;
  text-align: center;
  color: rgba(255,255,255,0.4);
}

.table-wrapper { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.15s;
}

tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(255,255,255,0.03); }

td { padding: 0.75rem 1rem; vertical-align: middle; }

.td-avatar { width: 52px; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0f3460;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #7eb8f7;
}

.td-name { font-weight: 600; }
.td-email { color: rgba(255,255,255,0.55); font-size: 0.85rem; }
.td-elo { font-weight: 600; color: #f4a261; }
.td-center { text-align: center; }
.td-no { color: rgba(255,255,255,0.2); }
.td-date { color: rgba(255,255,255,0.45); font-size: 0.85rem; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-google { background: rgba(66,133,244,0.2); color: #7eb8f7; }
.badge-email  { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
.badge-admin  { background: rgba(230,57,70,0.2); color: #e63946; }

.empty {
  text-align: center;
  padding: 3rem;
  color: rgba(255,255,255,0.3);
}
</style>
