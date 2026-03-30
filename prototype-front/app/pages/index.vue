<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { loggedIn, user, clear } = useUserSession()

const showDifficulty = ref(false)
const difficulty = ref('normale')
const router = useRouter()

const showAuthModal = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')

function loginWithGoogle() {
  window.location.href = '/auth/google'
}

async function loginWithCredentials() {
  loginError.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: loginEmail.value, password: loginPassword.value }
    })
    showAuthModal.value = false
  } catch (e) {
    loginError.value = 'Identifiants incorrects.'
  }
}

const showProfileModal = ref(false)
const profileTab = ref('en-cours')

function openProfile() {
  showProfileModal.value = true
}

function startIA() {
  showDifficulty.value = true
}

function confirmDifficulty() {
  router.push(`/jeu?mode=ia&level=${difficulty.value}`)
}

const showRulesModal = ref(false)
const showBugModal = ref(false)
const bugEmail = ref('')
const bugName = ref('')
const bugDescription = ref('')
const bugSent = ref(false)

async function sendBugReport() {
  // TODO: connecter à l'API
  bugSent.value = true
}

function closeBugModal() {
  showBugModal.value = false
  bugSent.value = false
  bugEmail.value = ''
  bugName.value = ''
  bugDescription.value = ''
}

const showSavedGamesModal = ref(false)
const showShopModal = ref(false)
</script>

<template>
  <div class="home">

    <!-- HEADER -->
    <header class="header">
      <h1 class="logo">
        <img src="/logo.png" alt="logo" class="logo-img" />
        Dam'eirb.fr
      </h1>

      <div class="auth">
        <button v-if="!loggedIn" class="btn-login" @click="showAuthModal = true">
          Connexion
        </button>

        <div v-else class="user-info">
          <button class="user-btn" @click="openProfile">
            <img
              :src="user?.picture ?? user?.avatar_url ?? ''"
              :alt="user?.name ?? ''"
              class="avatar"
            />
            <span class="username">{{ user?.name }}</span>
          </button>
          <button class="btn-signout" @click="clear()">Déconnexion</button>
        </div>
      </div>
    </header>

    <!-- CENTRE -->
    <div class="center-block">
      <h1 v-if="loggedIn" class="greeting">Bonjour {{ user?.name }} !</h1>

      <div class="main-panel">
        <h2>Choisissez votre mode de jeu :</h2>

        <div class="buttons">
          <template v-if="loggedIn">
            <NuxtLink to="/jeu?mode=online" class="btn-mode">
              <span class="btn-icon">🌐</span>
              Jouer en ligne
            </NuxtLink>
            <button class="btn-mode" @click="startIA">
              <span class="btn-icon">🤖</span>
              Jouer contre une IA
            </button>
          </template>

          <p v-else class="connect-hint" @click="showAuthModal = true">
            🔒 Connectez-vous pour jouer en ligne ou contre une IA
          </p>

          <NuxtLink to="/jeu?mode=local" class="btn-mode">
            <span class="btn-icon">👥</span>
            Jouer contre un ami
          </NuxtLink>
        </div>

        <!-- BOUTONS CARRÉS SOMBRES -->
        <div v-if="loggedIn" class="square-buttons">
          <button class="btn-square" @click="showSavedGamesModal = true">
            <span class="square-icon">💾</span>
            <span class="square-label">Mes parties</span>
          </button>
          <button class="btn-square" @click="showShopModal = true">
            <span class="square-icon">🛒</span>
            <span class="square-label">Boutique</span>
          </button>
        </div>
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
          <button class="btn-grey" @click="confirmDifficulty">Lancer la partie</button>
          <button class="btn-cancel" @click="showDifficulty = false">Annuler</button>
        </div>
      </div>
    </div>

    <!-- POPUP CONNEXION -->
    <div v-if="showAuthModal" class="modal" @click.self="showAuthModal = false">
      <div class="modal-content auth-modal">
        <button class="modal-close" @click="showAuthModal = false">✕</button>
        <h3>Connexion</h3>

        <button class="btn-google" @click="loginWithGoogle">
          <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Se connecter avec Google
        </button>

        <div class="separator"><span>ou</span></div>

        <div class="form-group">
          <label>Identifiant / Email</label>
          <input v-model="loginEmail" type="text" placeholder="exemple@mail.com" @keyup.enter="loginWithCredentials" />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="loginPassword" type="password" placeholder="••••••••" @keyup.enter="loginWithCredentials" />
        </div>

        <p v-if="loginError" class="login-error">{{ loginError }}</p>
        <button class="btn-grey full-width" @click="loginWithCredentials">Se connecter</button>
      </div>

      <NuxtLink to="/regles" class="rules-link" @click="open = false">📖 Règles du Jeu</NuxtLink>
    </div>

    <!-- POPUP PROFIL -->
    <div v-if="showProfileModal" class="modal" @click.self="showProfileModal = false">
      <div class="modal-content profile-modal">
        <button class="modal-close" @click="showProfileModal = false">✕</button>

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

    <!-- POPUP RÈGLES -->
    <div v-if="showRulesModal" class="modal" @click.self="showRulesModal = false">
      <div class="modal-content rules-modal">
        <button class="modal-close" @click="showRulesModal = false">✕</button>
        <h3>Règles du jeu de dames</h3>
        <div class="rules-content">
          <p>Les règles seront affichées ici.</p>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer-bar">
      <span class="footer-copy">© 2025 Dam'eirb.fr</span>
      <div class="footer-buttons">
        <button class="btn-mode btn-footer" @click="showRulesModal = true">
          <span class="btn-icon">📖</span>
          Règles
        </button>
        <button class="btn-mode btn-footer" @click="showBugModal = true">
          <span class="btn-icon">✉</span>
          Signaler un bug
        </button>
      </div>
    </footer>

    <!-- POPUP SIGNALER UN BUG -->
    <div v-if="showBugModal" class="modal" @click.self="closeBugModal">
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

    <!-- POPUP MES PARTIES -->
    <div v-if="showSavedGamesModal" class="modal" @click.self="showSavedGamesModal = false">
      <div class="modal-content saved-modal">
        <button class="modal-close" @click="showSavedGamesModal = false">✕</button>
        <h3>💾 Mes parties</h3>
        <p class="empty-state" style="padding-top: 1rem;">Aucune partie sauvegardée.</p>
      </div>
    </div>

    <!-- POPUP BOUTIQUE -->
    <div v-if="showShopModal" class="modal" @click.self="showShopModal = false">
      <div class="modal-content shop-modal">
        <button class="modal-close" @click="showShopModal = false">✕</button>
        <h3>🛒 Boutique</h3>
        <p class="empty-state" style="padding-top: 1rem;">Bientôt disponible.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&display=swap');

.home {
  --cell: min(9vh, 9vw);
  --panel-w: calc(var(--cell) * 6.5);
  --fs-base: clamp(1.05rem, calc(var(--cell) * 0.21), 1.4rem);
  --fs-lg:   clamp(1.25rem, calc(var(--cell) * 0.26), 1.7rem);
  --fs-xl:   clamp(2rem,    calc(var(--cell) * 0.44), 3.4rem);
  --pad-h:   clamp(1.2rem,  calc(var(--cell) * 0.3),  2.4rem);
  --pad-v:   clamp(0.7rem,  calc(var(--cell) * 0.18), 1.4rem);
  --radius:  clamp(9px,  calc(var(--cell) * 0.13), 16px);
  --gap:     clamp(0.95rem, calc(var(--cell) * 0.21), 1.6rem);
  --panel-bg: rgba(60, 60, 60, 0.85);

  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #abaaaa;
  position: relative;
  font-family: Arial, sans-serif;
  color: white;
}

.header,
.center-block {
  position: relative;
  z-index: 2;
}

/* ── HEADER ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--pad-v) var(--pad-h);
}

/* ── LOGO ── */
.logo {
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.22);
  margin: 0;
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2rem, calc(var(--cell) * 0.52), 3.6rem);
  font-weight: 900;
  letter-spacing: 0.04em;
  text-shadow: 0 3px 16px rgba(0,0,0,0.6);
}

.logo-img {
  width: clamp(64px, calc(var(--cell) * 1.1), 110px);
}

/* ── AUTH ── */
.auth {
  display: flex;
  align-items: center;
}

.btn-login {
  padding: calc(var(--pad-v) * 0.7) var(--pad-h);
  background: var(--panel-bg);
  color: white;
  font-size: var(--fs-base);
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  backdrop-filter: blur(6px);
}

.btn-login:hover {
  background: rgba(80, 80, 80, 0.9);
  transform: scale(1.03);
}

.user-info {
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.14);
}

.user-btn {
  display: flex;
  align-items: center;
  gap: calc(var(--cell) * 0.12);
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: calc(var(--pad-v) * 0.4) calc(var(--pad-v) * 0.7);
  border-radius: var(--radius);
  transition: background 0.2s;
}

.user-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar {
  width:  clamp(36px, calc(var(--cell) * 0.52), 58px);
  height: clamp(36px, calc(var(--cell) * 0.52), 58px);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  object-fit: cover;
}

.username {
  font-size: var(--fs-base);
  font-weight: 500;
}

.btn-signout {
  padding: calc(var(--pad-v) * 0.5) calc(var(--pad-h) * 0.7);
  background: var(--panel-bg);
  color: white;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: calc(var(--radius) * 0.7);
  font-size: calc(var(--fs-base) * 0.9);
  cursor: pointer;
  transition: background 0.2s;
}

.btn-signout:hover {
  background: rgba(80, 80, 80, 0.9);
}

/* ── CENTRE ── */
.center-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: calc(var(--cell) * 0.22);
  padding-bottom: calc(var(--cell) * 1.2);
}

/* ── GREETING ── */
.greeting {
  text-align: center;
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}

/* ── PANNEAU PRINCIPAL ── */
.main-panel {
  width: var(--panel-w);
  padding: calc(var(--cell) * 0.8) calc(var(--cell) * 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
  text-align: center;
  min-height: calc(var(--cell) * 5);
}

.main-panel h2 {
  margin: 0;
  font-size: var(--fs-lg);
}

.buttons {
  margin-top: calc(var(--cell) * 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  width: 100%;
  flex: 1;
}


/* ── BOUTONS MODE ── */
.btn-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--cell) * 0.15);
  padding: calc(var(--cell) * 0.15) calc(var(--cell) * 0.25);
  background: #b0b0b0;
  color: black;
  text-decoration: none;
  border-radius: var(--radius);
  font-size: var(--fs-lg);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  font-weight: 500;
}

.btn-mode:hover {
  background: #c8c8c8;
  transform: scale(1.04);
}

.btn-icon {
  font-size: calc(var(--fs-lg) * 1.15);
}

/* ── CONNECT HINT ── */
.connect-hint {
  margin: 0;
  padding: calc(var(--cell) * 0.14) calc(var(--cell) * 0.21);
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.25);
  border-radius: var(--radius);
  font-size: var(--fs-base);
  color: rgba(255, 255, 255, 0.6);
/* LIEN RÈGLES */
.rules-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 1.5rem;
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

/* BOUTONS GÉNÉRIQUES */
.btn-grey {
  padding: 1rem 2rem;
  background: #9c9c9c;
  color: black;
  border-radius: 10px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, color 0.2s;
}

.connect-hint:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

/* ── MODAL (base) ── */
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

.modal-content select {
  padding: calc(var(--cell) * 0.1);
  border-radius: var(--radius);
  border: none;
  font-size: var(--fs-base);
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 0.3rem;
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

/* ── BOUTONS GÉNÉRIQUES ── */
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

.btn-grey:hover {
  background: #b5b5b5;
  transform: scale(1.04);
}

.btn-cancel {
  background: #444;
  color: white;
  padding: calc(var(--cell) * 0.115) calc(var(--cell) * 0.21);
  border-radius: var(--radius);
  font-size: var(--fs-base);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-cancel:hover { background: #555; }

.full-width { width: 100%; }

/* ── AUTH MODAL ── */
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

.google-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

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

/* ── BOUTONS CARRÉS SOMBRES ── */
.square-buttons {
  display: flex;
  gap: calc(var(--gap) * 6);;
  width: 100%;
  justify-content: center;
  max-width: 100%;
  align-items: center;
  margin-top: var(--gap);
}


.btn-square {
  flex: 0 0 45%;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--cell) * 0.1);
  background: rgba(30, 30, 30, 0.9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  font-family: inherit;
  max-width: 160px; 
}

.btn-square:hover {
  background: rgba(50, 50, 50, 0.95);
  transform: scale(1.04);
}

.square-icon {
  font-size: calc(var(--fs-xl) * 0.7);
  line-height: 1;
}

.square-label {
  font-size: var(--fs-base);
  font-weight: 500;
}

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

/* ── SAVED / SHOP MODALS ── */
.saved-modal,
.shop-modal {
  position: relative;
  width: clamp(320px, calc(var(--panel-w) * 0.9), 520px);
}

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

.empty-state {
  margin: 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: var(--fs-base);
  text-align: center;
  padding-top: calc(var(--cell) * 0.29);
}

/* ── RULES MODAL ── */
.rules-modal {
  position: relative;
  width: clamp(340px, calc(var(--panel-w) * 1.1), 620px);
}

.rules-content {
  color: rgba(255, 255, 255, 0.75);
  font-size: var(--fs-base);
  line-height: 1.6;
}

/* ── FOOTER ── */
.footer-bar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem var(--pad-h);
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(0, 0, 0, 0.4);
  font-size: calc(var(--fs-base) * 0.82);
  color: rgba(255, 255, 255, 0.55);
}

.footer-copy {
  white-space: nowrap;
}

.footer-buttons {
  display: flex;
  gap: calc(var(--gap) * 0.6);
}

.btn-footer {
  padding: calc(var(--cell) * 0.09) calc(var(--cell) * 0.18);
  font-size: var(--fs-base);
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>