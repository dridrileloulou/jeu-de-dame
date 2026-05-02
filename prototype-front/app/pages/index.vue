<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/index/Header.vue'
import GameModePanel from '../components/index/GameModePanel.vue'
import DifficultyModal from '../components/index/DifficultyModal.vue'
import AuthModal from '../components/index/AuthModal.vue'
import ProfileModal from '../components/index/ProfileModal.vue'
import BugModal from '../components/index/BugModal.vue'
import SavedGamesModal from '../components/index/SavedGamesModal.vue'
import ShopModal from '../components/index/ShopModal.vue'
import AdminModal from '../components/index/AdminModal.vue'
import FooterBar from '../components/index/FooterBar.vue'

const { loggedIn, user, clear } = useUserSession()

const showDifficulty = ref(false)
const router = useRouter()

const showAuthModal = ref(false)

const showProfileModal = ref(false)
const profileTab = ref('en-cours')

function openProfile() {
  showProfileModal.value = true
}

function startIA() {
  showDifficulty.value = true
}

async function confirmDifficulty(level) {
  try {
    await $fetch('/api/launch-ia', {
      method: 'POST',
      body: { level: level }
    })
    router.push({ path: '/jeu-ia', query: { level } })
  } catch (err) {
    console.error('Erreur lors du lancement de l\'IA :', err)
  }
  showDifficulty.value = false
}

const showBugModal = ref(false)

const showSavedGamesModal = ref(false)
const showShopModal = ref(false)
const showAdminModal = ref(false)

onMounted(() => {
  if (!loggedIn.value) showAuthModal.value = true
})
</script>

<template>
  <div class="home">

    <!-- HEADER -->
    <Header @open-auth="showAuthModal = true" @open-profile="openProfile" @open-admin="showAdminModal = true" />

    <!-- CENTRE -->
    <GameModePanel
      :logged-in="loggedIn"
      :user="user"
      @start-ia="() => { console.log('Bouton IA cliqué'); startIA(); }"
      @open-auth="showAuthModal = true"
      @open-saved-games="showSavedGamesModal = true"
      @open-shop="showShopModal = true"
    />

    <!-- POPUP DIFFICULTY -->
    <DifficultyModal
      :show="showDifficulty"
      @confirm="confirmDifficulty"
      @close="showDifficulty = false"
    />

    <!-- POPUP CONNEXION -->
    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
    />

    <!-- POPUP PROFIL -->
    <ProfileModal
      :show="showProfileModal"
      :user="user"
      @close="showProfileModal = false"
    />

    <!-- FOOTER -->
    <FooterBar
      @open-bug="showBugModal = true"
    />

    <!-- POPUP SIGNALER UN BUG -->
    <BugModal
      :show="showBugModal"
      @close="showBugModal = false"
    />

    <!-- POPUP MES PARTIES -->
    <SavedGamesModal
      :show="showSavedGamesModal"
      @close="showSavedGamesModal = false"
    />

    <!-- POPUP BOUTIQUE -->
    <ShopModal
      :show="showShopModal"
      @close="showShopModal = false"
    />

    <!-- POPUP ADMIN -->
    <AdminModal
      :show="showAdminModal"
      @close="showAdminModal = false"
    />

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
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
}
</style>
