<template>
  <div class="chat-wrapper" :class="{ collapsed }">
    <!-- Header -->
    <div class="chat-header" @click="collapsed = !collapsed">
      <div class="ai-avatar">
        <span class="avatar-icon">♛</span>
        <span class="avatar-status" :class="{ typing: isTyping && !collapsed }"></span>
      </div>
      <div class="ai-info">
        <span class="ai-name">IA Dames</span>
        <span class="ai-status">{{ collapsed ? 'cliquer pour ouvrir' : isTyping ? 'en train d\'écrire…' : 'en ligne' }}</span>
      </div>
      <button class="toggle-btn" @click.stop="collapsed = !collapsed" :title="collapsed ? 'Afficher' : 'Réduire'">
        {{ collapsed ? '▲' : '▼' }}
      </button>
    </div>

    <!-- Messages -->
    <div class="chat-body" ref="chatBody" v-show="!collapsed">
      <TransitionGroup name="message" tag="div" class="messages-container">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-row"
          :class="msg.sender === 'ai' ? 'row-ai' : 'row-player'"
        >
          <div v-if="msg.sender === 'ai'" class="avatar-mini">♛</div>
          <div class="bubble" :class="msg.sender === 'ai' ? 'bubble-ai' : 'bubble-player'">
            {{ msg.text }}
            <span class="timestamp">{{ msg.time }}</span>
          </div>
        </div>
      </TransitionGroup>

      <!-- Typing indicator -->
      <Transition name="typing-fade">
        <div v-if="isTyping" class="message-row row-ai typing-row">
          <div class="avatar-mini">♛</div>
          <div class="bubble bubble-ai bubble-typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Input optionnel joueur -->
    <div class="chat-footer" v-show="!collapsed">
      <input
        v-model="playerInput"
        class="player-input"
        placeholder="Écrire un message..."
        maxlength="100"
        @keydown.enter="sendPlayerMessage"
      />
      <button class="send-btn" @click="sendPlayerMessage" :disabled="!playerInput.trim()">
        ➤
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

// ─── Expose pour l'appel externe ─────────────────────────────────────────────
defineExpose({ triggerEvent, showAiMove, showCoachAnalysis })

// ─── État ─────────────────────────────────────────────────────────────────────
const messages    = ref([])
const isTyping    = ref(false)
const chatBody    = ref(null)
const playerInput = ref('')
const collapsed   = ref(false)
let   msgCounter  = 0

// ─── Bibliothèque de phrases par événement ───────────────────────────────────
const phrases = {
  game_start: [
    'Bonne chance… tu vas en avoir besoin. 😏',
    'On commence ? Je te laisse le premier coup… cette fois.',
    'Prêt à perdre ? Allez, vas-y. 🎯',
    'Je t\'ai à l\'œil. Chaque mouvement compte.',
  ],
  good_move: [
    'Pas mal… je ne m\'y attendais pas.',
    'Intéressant. Tu progresses. 🤔',
    'Bien joué. Mais j\'ai un plan.',
    'Ah, tu as du potentiel. Dommage.',
  ],
  bad_move: [
    'Tu aurais pu mieux faire, non ?',
    'Hmm… ce n\'était pas le meilleur choix. 😬',
    'Je ne veux même pas commenter ça.',
    'Intéressant… comme erreur. 🙃',
  ],
  ai_captures: [
    'Je prends ça, merci. 😎',
    '+1 pour moi. Comme prévu.',
    'Cette pièce m\'appartenait déjà. ♟️',
    'Tu me l\'offres ? Trop gentil.',
  ],
  player_captures: [
    'Bien… mais ça ne changera rien. 😤',
    'Tu as de la chance. Profites-en.',
    'Accord. Je me relève. ⚔️',
    'Petite victoire. La guerre continue.',
  ],
  player_wins: [
    'Bien joué. Je ne l\'admets pas souvent. 👏',
    'Tu as gagné cette fois. Revanche ?',
    'Félicitations, humain. 🏆',
    'OK OK… t\'as été bon. Cette fois.',
  ],
  ai_wins: [
    'Facile. 😎 On rejoue ?',
    'Comme prévu. Mieux vaut t\'entraîner.',
    'Partie terminée. Je suis généreux : GG.',
    'La machine l\'emporte. Encore. 🤖',
  ],
  king_promotion: [
    'Une dame ! Le jeu devient sérieux. 👑',
    'Promotion obtenue… ça t\'ira bien.',
    'Ah, une dame sur le plateau. Prudence.',
    'Bien manœuvré pour la promotion. 🎖️',
  ],
}

// ─── Événement générique (joueur, début de partie, etc.) ─────────────────────
async function triggerEvent(eventName) {
  const pool = phrases[eventName]
  if (!pool) return
  const text = pool[Math.floor(Math.random() * pool.length)]
  await showTypingThenMessage(text, 'ai')
}

// ─── Analyse du coup du joueur par le coach ───────────────────────────────────
async function showCoachAnalysis(text) {
  await pushMessage(text, 'ai')
}

// ─── Coup de l'IA : affiche l'explication du coup ────────────────────────────
async function showAiMove({ type, analysis, moveStr }) {
  const parts = moveStr ? moveStr.trim().split(' ') : []
  const from = parts[0] || '?'
  const to   = parts[1] || '?'

  let text = ''
  if (type === 'auto') {
    text = 'Je dois obligatoirement prendre ce pion.'
  } else if (type === 'minimax') {
    text = `Je joue de (${from}) vers (${to}).`
  } else {
    text = analysis || `Je joue de (${from}) vers (${to}).`
  }
  await showTypingThenMessage(text, 'ai')
}

// ─── Simulation "typing" puis affichage du message ───────────────────────────
async function showTypingThenMessage(text, sender = 'ai') {
  isTyping.value = true
  await scrollToBottom()

  const delay = 900 + Math.random() * 700
  await new Promise(r => setTimeout(r, delay))

  isTyping.value = false
  pushMessage(text, sender)
}

// ─── Ajouter un message ───────────────────────────────────────────────────────
async function pushMessage(text, sender = 'ai') {
  const now = new Date()
  messages.value.push({
    id:     ++msgCounter,
    text,
    sender,
    time: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`,
  })
  await nextTick()
  scrollToBottom()
}

// ─── Message joueur ───────────────────────────────────────────────────────────
async function sendPlayerMessage() {
  const text = playerInput.value.trim()
  if (!text) return
  playerInput.value = ''
  pushMessage(text, 'player')

  const reactions = [
    'Ha. Intéressant comme remarque.',
    'Je reste concentré. 🎯',
    'Parle moins, joue mieux. 😄',
    'Ok ok… on verra à la fin.',
    'Je note. Ça ne changera rien.',
  ]
  const reply = reactions[Math.floor(Math.random() * reactions.length)]
  await showTypingThenMessage(reply, 'ai')
}

// ─── Scroll automatique ───────────────────────────────────────────────────────
async function scrollToBottom() {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => triggerEvent('game_start'), 600)
})
</script>

<style scoped>
/* ── Variables & reset ─────────────────────────────────────────────────── */
.chat-wrapper {
  --bg-chat:     #1a1a1a;
  --bg-header:   #262626;
  --bg-footer:   #262626;
  --bubble-ai:   #6b6b6b;
  --bubble-ai-border: #888888;
  --bubble-player: #555555;
  --accent:      #b0b0b0;
  --accent-glow: rgba(176, 176, 176, 0.25);
  --text-main:   #e8eaf0;
  --text-muted:  #6b7280;
  --dot-color:   #b0b0b0;
  --radius-lg:   18px;
  --radius-sm:   6px;
  --font:        'Segoe UI', system-ui, sans-serif;

  display:        flex;
  flex-direction: column;
  width:          clamp(300px, 22vw, 420px);
  height:         clamp(460px, 72vh, 640px);
  border-radius:  20px;
  overflow:       hidden;
  font-family:    var(--font);
  background:     var(--bg-chat);
  box-shadow:     0 8px 40px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.05);
}

@media (max-width: 768px) {
  .chat-wrapper {
    width:         100%;
    max-width:     100%;
    height:        260px;
    border-radius: 14px;
  }
}

/* ── Collapsed state ───────────────────────────────────────────────────── */
.chat-wrapper.collapsed {
  height: auto;
}

/* ── Header ────────────────────────────────────────────────────────────── */
.chat-header {
  display:     flex;
  align-items: center;
  gap:         12px;
  padding:     14px 16px;
  background:  var(--bg-header);
  border-bottom: 1px solid rgba(255,255,255,.06);
  cursor:      pointer;
  user-select: none;
}
.chat-header:hover { background: #2e2e2e; }

.toggle-btn {
  margin-left: auto;
  background:  transparent;
  border:      none;
  color:       var(--text-muted);
  font-size:   12px;
  cursor:      pointer;
  padding:     2px 6px;
  border-radius: 4px;
  transition:  color .2s;
}
.toggle-btn:hover { color: var(--text-main); }

.ai-avatar {
  position: relative;
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #b0b0b0, #1e1e1e);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 0 12px var(--accent-glow);
  flex-shrink: 0;
}

.avatar-status {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid var(--bg-header);
  transition: background .3s;
}
.avatar-status.typing { background: #f59e0b; }

.ai-info { display: flex; flex-direction: column; }
.ai-name  { font-size: 14px; font-weight: 600; color: var(--text-main); }
.ai-status { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

/* ── Body ──────────────────────────────────────────────────────────────── */
.chat-body {
  flex: 1;
  overflow-y:  auto;
  padding:     12px 14px;
  scroll-behavior: smooth;
}

.chat-body::-webkit-scrollbar { width: 4px; }
.chat-body::-webkit-scrollbar-track { background: transparent; }
.chat-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

.messages-container { display: flex; flex-direction: column; gap: 8px; }

/* ── Message rows ──────────────────────────────────────────────────────── */
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
}

.row-ai     { justify-content: flex-start; }
.row-player { justify-content: flex-end; }
.typing-row { margin-top: 4px; }

/* ── Avatar mini ───────────────────────────────────────────────────────── */
.avatar-mini {
  flex-shrink: 0;
  width: 26px; height: 26px;
  background: linear-gradient(135deg, #3a3a3a, #1e1e1e);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
}

/* ── Bubbles ───────────────────────────────────────────────────────────── */
.bubble {
  max-width: 210px;
  padding: 9px 13px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  line-height: 1.5;
  position: relative;
  word-break: break-word;
}

.bubble-ai {
  background: var(--bubble-ai);
  border: 1px solid var(--bubble-ai-border);
  color: var(--text-main);
  border-bottom-left-radius: var(--radius-sm);
}

.bubble-player {
  background: var(--bubble-player);
  color: #fff;
  border-bottom-right-radius: var(--radius-sm);
  box-shadow: 0 2px 12px rgba(80,80,80,.4);
}

.timestamp {
  display:     block;
  font-size:   10px;
  color:       rgba(255,255,255,.35);
  margin-top:  4px;
  text-align:  right;
}
.bubble-ai .timestamp { color: var(--text-muted); }

/* ── Typing dots ───────────────────────────────────────────────────────── */
.bubble-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  min-width: 54px;
}

.dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--dot-color);
  animation: bounce 1.2s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }

@keyframes bounce {
  0%,80%,100% { transform: translateY(0); opacity:.4; }
  40%         { transform: translateY(-6px); opacity:1; }
}

/* ── Footer ────────────────────────────────────────────────────────────── */
.chat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-footer);
  border-top: 1px solid rgba(255,255,255,.06);
}

.player-input {
  flex: 1;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 12.5px;
  color: var(--text-main);
  outline: none;
  transition: border-color .2s;
}
.player-input::placeholder { color: var(--text-muted); }
.player-input:focus { border-color: var(--accent); }

.send-btn {
  width: 34px; height: 34px;
  background: #d0d0d0;
  border: 1px solid #666666;
  border-radius: 50%;
  color: #444444;
  font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s, box-shadow .15s, background .15s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  background: #585858;
  box-shadow: 0 0 10px rgba(176,176,176,.2);
}
.send-btn:disabled { opacity: .35; cursor: default; }

/* ── Transitions ───────────────────────────────────────────────────────── */
.message-enter-active {
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
}
.message-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(.95);
}

.typing-fade-enter-active,
.typing-fade-leave-active { transition: opacity .25s; }
.typing-fade-enter-from,
.typing-fade-leave-to  { opacity: 0; }
</style>
