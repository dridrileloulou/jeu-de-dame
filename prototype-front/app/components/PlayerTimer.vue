<template>
  <div class="timer-box" :class="[color, { active: isActive }]">
    <div class="timer-text">{{ formattedTime }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeRemaining: {
    type: Number,
    default: 600
  },
  color: {
    type: String,
    default: 'white'
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60).toString().padStart(2, '0')
  const seconds = (props.timeRemaining % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})
</script>

<style scoped>
.timer-box {

  padding: 12px 20px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;

  border: 2px solid #000;
}

.timer-text {
  /* --- LA POLICE CLASSIQUE ET NETTE DE TES BOUTONS D'ACCUEIL --- */
  font-family: Arial, Helvetica, 'Courier New', monospace; /* Priorité à Arial/Helvetica pour la netteté */
  font-size: 1.6rem;
  font-weight: bold; /* Gras comme tes boutons */
  text-align: center;
  font-variant-numeric: tabular-nums; /* Très important : force la même largeur pour tous les chiffres */
}

/* --- ÉTAT INACTIF (Les couleurs exactes de ton image) --- */

/* Joueur BLANC : Fond gris clair #b0b0b0, Texte gris foncé #262626 */
.timer-box.white {
  background-color: #b0b0b0;
}
.timer-box.white .timer-text {
  color: #262626;
}

/* Joueur NOIR : Fond gris foncé #262626, Texte gris clair #b0b0b0 */
.timer-box.black {
  background-color: #262626;
}
.timer-box.black .timer-text {
  color: #b0b0b0;
}

/* --- ÉTAT ACTIF (Quand il décompte : Ton rouge #ff2200) --- */
.timer-box.active {
  background-color: #1a0505 !important; /* Fond très sombre */
  border: 2px solid #ff2200 !important;
  box-shadow: 0 0 15px rgba(255, 34, 0, 0.4);
  transform: scale(1.05);
}

.timer-box.active .timer-text {
  color: #ff2200 !important;
  text-shadow: 0 0 8px rgba(255, 34, 0, 0.6);
}

/* On garde l'animation de pulse discrète pour le joueur actif */
.timer-box.active {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
</style>