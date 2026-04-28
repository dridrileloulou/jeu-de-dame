<script setup>
const emit = defineEmits(['open-auth', 'open-profile'])
const { loggedIn, user, clear } = useUserSession()
</script>

<template>
  <header class="header">
    <h1 class="logo">
      <img src="/logo.png" alt="logo" class="logo-img" />
      Dam'eirb.fr
    </h1>

    <div class="auth">
      <button v-if="!loggedIn" class="btn-login" @click="emit('open-auth')">
        Connexion
      </button>

      <div v-else class="user-info">
        <button class="user-btn" @click="emit('open-profile')">
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
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--pad-v) var(--pad-h);
  position: relative;
  z-index: 2;
}

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
  width: clamp(36px, calc(var(--cell) * 0.52), 58px);
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
