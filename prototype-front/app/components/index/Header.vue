import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth'

const { loggedIn, user, clear } = useAuth()
const showAuthModal = ref(false)

<template>
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
</template>

<script setup>

</script>