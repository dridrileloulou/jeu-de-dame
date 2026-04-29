# Contexte Projet — Jeu de Dames

## Stack

- **Nuxt 4** (`nuxt ^4.3.1`), `srcDir: 'app/'` (config implicite Nuxt 4)
- **Vue 3** + Composition API (`<script setup>`)
- **MongoDB / Mongoose** — auth + stockage parties
- **nuxt-auth-utils** — sessions côté serveur
- **WebSocket** natif Nitro (`nitro.experimental.websocket: true`)
- **No TypeScript strict** côté front — backend `.ts` mais pages/components `.vue` JS

## Répertoires clés

```
jeu-de-dame/                  ← racine git
└── prototype-front/
    ├── nuxt.config.ts
    ├── package.json
    ├── app/
    │   ├── app.vue
    │   ├── assets/styles/global.css
    │   ├── pages/
    │   │   ├── index.vue          ← accueil (GameModePanel, modals)
    │   │   ├── jeu.vue            ← plateau solo/test
    │   │   ├── jeu-offline.vue    ← 2 joueurs même écran
    │   │   ├── jeu-ia.vue         ← vs IA
    │   │   ├── jeu-online.vue     ← lobby + plateau en ligne
    │   │   ├── regles.vue
    │   │   └── admin.vue
    │   ├── components/
    │   │   ├── GameBar.vue        ← barre supérieure (46px de haut)
    │   │   ├── NavMenu.vue
    │   │   └── index/             ← modals de la page d'accueil
    │   │       ├── AuthModal.vue
    │   │       ├── GameModePanel.vue
    │   │       ├── DifficultyModal.vue
    │   │       ├── SavedGamesModal.vue
    │   │       ├── ShopModal.vue
    │   │       ├── ProfileModal.vue
    │   │       ├── AdminModal.vue
    │   │       ├── BugModal.vue
    │   │       ├── RulesModal.vue
    │   │       ├── Header.vue
    │   │       └── FooterBar.vue
    │   ├── engine/                ← TOUT le moteur de jeu
    │   │   ├── Board.js           ← état plateau 10×10
    │   │   ├── Game.js            ← logique principale (mouvements, captures, fin)
    │   │   ├── Movement.js        ← calcul coups valides
    │   │   ├── Piece.js           ← classe Pièce
    │   │   ├── GameBoard.vue      ← plateau générique (solo/test)
    │   │   ├── GameBoardOffline.vue ← plateau 2 joueurs local
    │   │   ├── GameBoardOnline.vue  ← plateau en ligne (WebSocket)
    │   │   ├── GameBoardIA.vue    ← plateau vs IA
    │   │   ├── PlayerTimer.vue    ← timer par joueur
    │   │   ├── PlayerTurn.vue     ← indicateur tour
    │   │   └── GameTimer.vue      ← timer global
    │   ├── composables/
    │   │   └── useAuth.ts
    │   ├── middleware/
    │   │   └── admin.ts
    │   └── stores/
    │       └── gameStore.ts
    └── server/
        ├── api/
        │   ├── auth/              ← login, logout, register, me
        │   ├── game/              ← create.post, join.post, [code].get
        │   ├── board/             ← init, move-piece, valid-moves
        │   └── admin/             ← users CRUD
        ├── models/user.ts
        ├── plugins/seed.ts
        ├── routes/
        │   ├── auth/google.get.ts
        │   └── ws/game.ts         ← WebSocket handler principal
        └── utils/
            ├── db.ts
            ├── jwt.ts
            └── rooms.ts           ← Map<code, Room> en mémoire
```

## Imports dans les pages (IMPORTANT)

Nuxt 4 n'auto-importe pas `engine/`. Les pages importent **explicitement** :

```js
// jeu-offline.vue
import GameBoardOffline from '../engine/GameBoardOffline.vue'

// jeu-online.vue
import GameBoardOnline from '../engine/GameBoardOnline.vue'

// jeu-ia.vue
import GameBoardIA from '../engine/GameBoardIA.vue'
```

À l'intérieur de `engine/`, les imports sont relatifs :

```js
// GameBoardOnline.vue
import { Game } from './Game.js'
import PlayerTimer from './PlayerTimer.vue'
import PlayerTurn from './PlayerTurn.vue'
```

## Mode en ligne — Architecture WebSocket

### Flux de jeu

1. **Créer** : `POST /api/game/create` → génère code 6 lettres, insère dans `rooms` Map
2. **Rejoindre** : `POST /api/game/join` → valide code, ajoute joinerId dans room
3. **WS connect** : `ws://host/ws/game` — chaque joueur envoie `{type:'init', code, userId}`
4. Quand les 2 peers connectés → serveur envoie `{type:'start', color:'white'|'black', timerSeconds}`
5. Coups : `{type:'move', ...}` → relayé à l'adversaire
6. Fin : `{type:'end', winner, reason}` ou `{type:'opponent_disconnected'}`

### Room (rooms.ts)

```ts
Map<string, {
  creatorId, joinerId,
  peerCreator?, peerJoiner?,
  params: { timer, customSeconds, creatorColor },
  creatorColor?, joinerColor?,
  status: 'waiting' | 'playing' | 'finished'
}>
```

## Sizing du plateau — Règle CSS

### Problème
Le plateau 10×10 doit tenir dans la viewport **sans scroll** ni zoom, en soustrayant tout le chrome UI.

### Formule actuelle

**Online** (`GameBoardOnline.vue`) :
```css
.cell {
  /* right-panel(170) + gaps+padding(100) = 270px horiz
     gamebar(46) + strips(88) + controls(40) + padding+border(96) = 270px vert */
  width:  clamp(30px, min(calc((100vw - 270px) / 10), calc((100dvh - 270px) / 10)), 78px);
  height: clamp(30px, min(calc((100vw - 270px) / 10), calc((100dvh - 270px) / 10)), 78px);
}
/* mobile ≤700px */
@media (max-width: 700px) {
  .cell {
    width:  min(calc((100vw - 36px) / 10), calc((100dvh - 230px) / 10));
    height: min(calc((100vw - 36px) / 10), calc((100dvh - 230px) / 10));
  }
}
```

**Offline** (`GameBoardOffline.vue`) :
```css
.cell {
  /* gamebar(46) + strips(88) + controls(40) + padding/gaps/border(76) = 250px */
  width:  clamp(30px, min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10)), 78px);
  height: clamp(30px, min(calc((100vw - 36px) / 10), calc((100dvh - 250px) / 10)), 78px);
}
```

**Pourquoi `100dvh`** : dvh (dynamic viewport height) tient compte de la barre d'URL sur Safari iOS / Chrome Android. `100vh` ignore ces barres → overflow.

### Wrappers obligatoires
```css
.game-wrapper   { overflow: hidden; min-height: 0; }  /* Online */
.game-layout    { overflow: hidden; }                  /* Offline */
```
Sans `overflow: hidden`, le board déborde silencieusement.

## Lobby jeu-online.vue — Responsive

Mobile ≤480px — media query ajoutée :
```css
@media (max-width: 480px) {
  .backdrop { padding: 1rem 0.75rem; align-items: flex-start; padding-top: 1.5rem; }
  .modal { padding: 1.5rem 1.2rem; gap: 1rem; }
  /* ... pill, code-input, btn-launch réduits */
}
```
`.backdrop` a `overflow-y: auto` pour scroll sur très petits écrans.
Global : `@media (max-height: 600px) { body { overflow: auto; } }`

## Mode offline — Restriction mobile

`jeu-offline.vue` bloque sur mobile (≤700px) avec message d'erreur :
```html
<div class="mobile-block">  <!-- display:flex sur mobile -->
<div class="desktop-only">  <!-- display:none sur mobile -->
```

## Authentification

- **nuxt-auth-utils** gère sessions via `useUserSession()`
- JWT custom aussi présent (`server/utils/jwt.ts`) — parallèle aux sessions Nuxt
- Google OAuth : `server/routes/auth/google.get.ts`
- Admin flag sur User model → middleware `admin.ts` → page `admin.vue`

## Commandes utiles

```bash
cd prototype-front
npm run dev        # dev server
npm run build      # build prod
```

```bash
cd ..              # = jeu-de-dame/ (racine git)
git log --oneline
git push
```

## Git — Derniers commits

```
16f4e9e fix: increase overhead buffer in cell size calc, use dvh, add overflow hidden
f324700 fix: responsive board sizing and online lobby on mobile
4ba1032 refactor: move gameboard components and game helpers into engine/
001f255 feat: hide offline mode button on mobile
b07d842 feat: chess.com layout, GameBar replaces burger menu
```
