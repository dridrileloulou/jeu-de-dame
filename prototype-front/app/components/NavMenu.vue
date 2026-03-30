<template>
  <div class="nav">
    <div class="hamburger" @click="open = !open">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="menu" :class="{ visible: open }">
      <NuxtLink to="/" @click="open = false">Accueil</NuxtLink>
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
  top: 22px;
  left: 22px;
  cursor: pointer;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hamburger span {
  display: block;
  width: 30px;
  height: 3px;
  background: #bfbfbf;
  border-radius: 3px;
  transition: 0.2s;
}

.menu {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100vh;

  background: #262626;
  border-right: 1px solid rgba(255,255,255,0.1);

  display: flex;
  flex-direction: column;
  padding: 90px 30px;
  gap: 25px;

  transition: left 0.3s ease;
  z-index: 99;
}

.menu.visible {
  left: 0;
}

.menu a {
  color: #bfbfbf;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 500;
  transition: 0.2s;
}

.menu a:hover {
  color: white;
  transform: translateX(5px);
}
</style>