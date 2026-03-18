<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { loggedIn, user, clear } = useUserSession()

const showDifficulty = ref(false)
const difficulty = ref('normale')
const router = useRouter()

function loginWithGoogle() {
  window.location.href = '/auth/google'
}

function startIA() {
  showDifficulty.value = true
}

function confirmDifficulty() {
  router.push(`/jeu?mode=ia&level=${difficulty.value}`)
}
</script>

<template>
  <div class="home">

    <!-- HEADER -->
    <header class="header">
      <h1 class="logo">
        <img src="/logo.png" alt="logo" class="logo-img" />
        Jeu de Dames
      </h1>

      <div class="auth">
        <!-- Non connecté -->
        <button
          v-if="!loggedIn"
          class="btn-google"
          @click="loginWithGoogle"
        >
          <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Se connecter avec Google
        </button>

        <!-- Connecté -->
        <div v-else class="user-info">
          <img
            :src="user?.picture ?? user?.avatar_url ?? ''"
            :alt="user?.name ?? ''"
            class="avatar"
          />
          <span class="username">{{ user?.name }}</span>
          <button class="btn-signout" @click="clear()">Déconnexion</button>
        </div>
      </div>
    </header>

    <!-- MAIN PANEL -->
    <div class="main-panel">
      <h2>Choisissez votre mode de jeu</h2>

      <div class="buttons">
        <NuxtLink to="/jeu?mode=online" class="btn-mode">
          <span class="btn-icon">🌐</span>
          Jouer en ligne
        </NuxtLink>

        <button class="btn-mode" @click="startIA">
          <span class="btn-icon">🤖</span>
          Jouer contre une IA
        </button>

        <NuxtLink to="/jeu?mode=local" class="btn-mode">
          <span class="btn-icon">👥</span>
          Jouer contre un ami
        </NuxtLink>
      </div>
    </div>

    <!-- POPUP DIFFICULTY -->
    <div v-if="showDifficulty" class="modal" @click.self="showDifficulty = false">
      <div class="modal-content">
        <h3>Niveau de difficulté</h3>

        <select v-model="difficulty">
          <option value="facile">Facile</option>
          <option value="normale">Normale</option>
          <option value="difficile">Difficile</option>
          <option value="expert">Expert</option>
        </select>

        <div class="modal-buttons">
          <button class="btn-grey" @click="confirmDifficulty">
            Lancer la partie
          </button>
          <button class="btn-cancel" @click="showDifficulty = false">
            Annuler
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>

.home {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: url('/background.png') center/cover no-repeat;
  position: relative;
  font-family: Arial, sans-serif;
  color: white;
}

.home::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}

.header,
.main-panel {
  position: relative;
  z-index: 2;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0;
  font-size: 1.4rem;
}

.logo-img {
  width: 45px;
}

/* AUTH */
.auth {
  display: flex;
  align-items: center;
}

/* BOUTON GOOGLE */
.btn-google {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.6rem 1.2rem;
  background: white;
  color: #444;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.btn-google:hover {
  background: #f0f0f0;
  transform: scale(1.03);
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* UTILISATEUR CONNECTÉ */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  object-fit: cover;
}

.username {
  font-size: 0.95rem;
  font-weight: 500;
}

.btn-signout {
  padding: 0.4rem 0.9rem;
  background: rgba(255,255,255,0.15);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-signout:hover {
  background: rgba(255,255,255,0.25);
}

/* PANNEAU CENTRAL */
.main-panel {
  width: 420px;
  padding: 3rem 2rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  text-align: center;
}

.buttons {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* BOUTONS DE MODE */
.btn-mode {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 2rem;
  background: #9c9c9c;
  color: black;
  text-decoration: none;
  border-radius: 10px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
}

.btn-mode:hover {
  background: #b5b5b5;
  transform: scale(1.05);
}

.btn-icon {
  font-size: 1.3rem;
}

/* BOUTONS GÉNÉRIQUES */
.btn-grey {
  padding: 1rem 2rem;
  background: #9c9c9c;
  color: black;
  border-radius: 10px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-grey:hover {
  background: #b5b5b5;
  transform: scale(1.05);
}

.btn-cancel {
  background: #444;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #555;
}

/* MODAL */
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
  padding: 2rem;
  border-radius: 15px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content h3 {
  margin: 0;
  text-align: center;
}

.modal-content select {
  padding: 0.7rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

</style>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>