<template>
  <div class="nav">
    <div class="hamburger" @click="open = !open">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="menu" :class="{ visible: open }">
      <NuxtLink to="/" @click="open = false">Accueil</NuxtLink>
      <NuxtLink to="/jeu" @click="open = false">Jouer</NuxtLink>
      <NuxtLink to="/regles" @click="open = false">Règles</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
.hamburger {
  position: fixed;
  top: 20px;
  left: 20px;
  cursor: pointer;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hamburger span {
  display: block;
  width: 30px;
  height: 3px;
  background: white;
  border-radius: 3px;
}

.menu {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100vh;
  background: #0c0131;
  display: flex;
  flex-direction: column;
  padding: 80px 30px;
  gap: 20px;
  transition: left 0.3s ease;
  z-index: 99;
}

.menu.visible {
  left: 0;
}

.menu a {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
}

.menu a:hover {
  color: gold;
}
</style>