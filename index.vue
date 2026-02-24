<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const showLogin = ref(false)
const showDifficulty = ref(false)

const username = ref('')
const password = ref('')
const difficulty = ref('normale')

const router = useRouter()

function login() {
  console.log("Connexion :", username.value)
  showLogin.value = false
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
        <img src="/logo.png" alt="logo" class="logo-img"/>
        Jeu de Dames en Ligne
      </h1>

      <div class="auth">
        <button class="btn-grey" @click="showLogin = true">
          Connexion
        </button>
      </div>
    </header>

    <!-- MAIN PANEL -->
    <div class="main-panel">
      <h2>Choisissez votre mode de jeu</h2>

      <div class="buttons">
        <NuxtLink to="/jeu?mode=online" class="btn-grey">
          🌍 Jouer en ligne
        </NuxtLink>

        <button class="btn-grey" @click="startIA">
          🤖 Jouer contre une IA
        </button>

        <NuxtLink to="/jeu?mode=local" class="btn-grey">
          👥 Jouer contre un ami
        </NuxtLink>
      </div>
    </div>

    <!-- POPUP LOGIN -->
    <div v-if="showLogin" class="modal">
      <div class="modal-content">
        <h3>Connexion</h3>

        <input v-model="username" placeholder="Identifiant" />
        <input v-model="password" type="password" placeholder="Mot de passe" />

        <div class="modal-buttons">
          <button class="btn-grey" @click="login">Valider</button>
          <button class="btn-cancel" @click="showLogin = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- POPUP DIFFICULTY -->
    <div v-if="showDifficulty" class="modal">
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
  height: 100dvh; /* plus fiable que 100vh */
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
}

.logo-img {
  width: 45px;
}

/* PANNEAU CENTRAL */
.main-panel {
  width: 420px;
  padding: 3rem 2rem;
  margin: 0 auto;
  margin-bottom: auto;
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
}

/* BOUTONS GRIS DU LOGO */
.btn-grey {
  padding: 1rem 2rem;
  background: #9c9c9c;
  color: black;
  text-decoration: none;
  border-radius: 10px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: 0.3s;
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

.modal-content input,
.modal-content select {
  padding: 0.7rem;
  border-radius: 8px;
  border: none;
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