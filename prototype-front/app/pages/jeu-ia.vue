<template>
  <div class="game">

    <!-- Bouton accueil fixe (mobile uniquement) -->
    <NuxtLink to="/" class="mobile-home-btn">← Accueil</NuxtLink>

    <div class="game-content">
      <!-- NavMenu masqué sur mobile via CSS -->
      <div class="nav-desktop"><NavMenu /></div>

      <GameBoardIA
        v-if="ready"
        :level="level"
        :saved-game-id="resumeId"
        :initial-state="resumeState"
        :is-demo="!!resumeState?.isDemo"
        :on-ai-move="onAiMove"
        :on-player-move="onPlayerMove"
      />

      <!-- Chat : inline sur desktop, overlay sur mobile -->
      <div
        class="chat-ia-container"
        :class="{ 'chat-open': chatMobileOpen }"
        @click.self="chatMobileOpen = false"
      >
        <ChatIA ref="chatRef" />
      </div>
    </div>

    <!-- FAB Gemini (mobile uniquement) -->
    <button
      class="chat-fab"
      :class="{ active: chatMobileOpen }"
      @click="chatMobileOpen ? closeChatMobile() : openChatMobile()"
      aria-label="Chat Gemini"
    >
      <span class="fab-icon">{{ chatMobileOpen ? '✕' : '✦' }}</span>
      <span v-if="fabNotif > 0 && !chatMobileOpen" class="fab-badge">{{ fabNotif }}</span>
    </button>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavMenu from '../components/NavMenu.vue'
import GameBoardIA from '../components/game/GameBoardIA.vue'
import ChatIA from '../components/game/ChatIA.vue'

const route = useRoute()
const level = computed(() => route.query.level || 'normale')

const resumeId       = ref(null)
const resumeState    = ref(null)
const ready          = ref(false)
const chatRef        = ref(null)
const chatMobileOpen = ref(false)
const fabNotif       = ref(0)

function openChatMobile() {
  chatMobileOpen.value = true
  fabNotif.value = 0
}

function closeChatMobile() {
  chatMobileOpen.value = false
}

function onAiMove(info) {
  chatRef.value?.showAiMove(info)
  if (!chatMobileOpen.value) fabNotif.value++
}

async function onPlayerMove(info) {
  try {
    const data = await $fetch('/api/coach-move', { method: 'POST', body: info })
    if (data.analysis) {
      await chatRef.value?.showCoachAnalysis(data.analysis)
      if (!chatMobileOpen.value) fabNotif.value++
    }
  } catch {}
}

function buildDemoBoard() {
  const b = Array.from({ length: 10 }, () => Array(10).fill(null))
  b[1][3] = { color: 'black', isDraught: false }
  b[1][7] = { color: 'black', isDraught: false }
  b[6][2] = { color: 'white', isDraught: false }
  b[6][6] = { color: 'white', isDraught: false }
  b[8][4] = { color: 'white', isDraught: false }
  return b
}

onMounted(async () => {
  if (route.query.demo === '1') {
    resumeState.value = {
      board: buildDemoBoard(),
      currentPlayer: 'white',
      whiteCaptured: 8,
      blackCaptured: 2,
    }
    ready.value = true
    return
  }

  const id = route.query.resume?.toString()
  if (!id) { ready.value = true; return }
  try {
    const games = await $fetch('/api/local-games')
    const g = games.find(g => g._id === id)
    if (g) {
      resumeState.value = g
      resumeId.value    = g._id
    }
  } catch {}
  ready.value = true
})
</script>

<style>
body { overflow: hidden; }
@media (max-width: 768px) {
  body { overflow-x: hidden; overflow-y: auto; }
}
</style>

<style scoped>
/* ── Layout de base ───────────────────────────────────────────── */
.game {
  min-height: 100vh;
  background: #abaaaa;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: white;
  font-family: Arial, sans-serif;
}

.game-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  padding-left: 100px;
  padding-right: 24px;
  min-height: 100vh;
}

/* Tablette */
@media (max-width: 1024px) and (min-width: 769px) {
  .game-content {
    padding-left: 70px;
    padding-right: 12px;
    gap: 16px;
  }
}

/* ══════════════════════════════════════════════════════════════
   MOBILE (≤ 768px) — tous les changements sont ici
   ══════════════════════════════════════════════════════════════ */

/* Bouton accueil (caché sur desktop) */
.mobile-home-btn {
  display: none;
}

/* FAB chat (caché sur desktop) */
.chat-fab {
  display: none;
}

/* Chat container : sur desktop c'est juste un div transparent */
.chat-ia-container {
  /* rien de spécial sur desktop */
}

@media (max-width: 768px) {

  /* NavMenu masqué */
  .nav-desktop {
    display: none;
  }

  /* Layout vertical, centré, padding pour le bouton home fixe */
  .game-content {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px 8px 80px;
    gap: 8px;
    min-height: 100vh;
  }

  /* ── Bouton accueil fixe en haut à gauche ── */
  .mobile-home-btn {
    display: flex;
    align-items: center;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 500;
    background: rgba(40, 40, 40, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    text-decoration: none;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* ── Chat overlay ── */
  .chat-ia-container {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: transparent;
    pointer-events: none;
    transition: background 0.25s;
  }

  .chat-ia-container.chat-open {
    background: rgba(0, 0, 0, 0.55);
    pointer-events: auto;
  }

  /* Slide du chat depuis le bas */
  .chat-ia-container :deep(.chat-wrapper) {
    width: 100% !important;
    max-width: 480px;
    height: 72vh !important;
    min-height: 0 !important;
    border-radius: 20px 20px 0 0 !important;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
  }

  .chat-ia-container.chat-open :deep(.chat-wrapper) {
    transform: translateY(0);
  }

  /* ── FAB Gemini ── */
  .chat-fab {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 400;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: #444;
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
    transition: transform 0.2s, background 0.2s;
  }

  .chat-fab.active {
    background: #333;
    transform: rotate(90deg) scale(0.95);
  }

  .fab-icon {
    font-size: 1.3rem;
    line-height: 1;
  }

  .fab-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #e74c3c;
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid #abaaaa;
    animation: badge-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes badge-pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }
}
</style>
