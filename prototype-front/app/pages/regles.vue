<script setup>
import GameBar from '../components/GameBar.vue'
</script>

<template>
  <div class="page">
    <GameBar title="Règles du jeu" />

    <div class="content">

      <header class="hero">
        <div class="hero-icon">♟</div>
        <h1>Règles du Jeu de Dames</h1>
        <p class="hero-sub">Jeu de dames international — plateau 10×10</p>
      </header>

      <nav class="toc">
        <a href="#plateau">Plateau</a>
        <a href="#deplacement">Déplacement</a>
        <a href="#prise">Prise</a>
        <a href="#raffle">Raffle</a>
        <a href="#dame">La dame</a>
        <a href="#fin">Fin de partie</a>
      </nav>

      <!-- PLATEAU -->
      <section id="plateau" class="section">
        <div class="section-header">
          <span class="section-icon">🟫</span>
          <h2>Plateau &amp; pièces</h2>
        </div>
        <div class="section-body">
          <div class="rule-cards">
            <div class="rule-card">
              <span class="rc-num">10×10</span>
              <p>Le plateau comporte <strong>100 cases</strong>, alternant cases sombres et claires. Les pièces se déplacent uniquement sur les <strong>cases sombres</strong>.</p>
            </div>
            <div class="rule-card">
              <span class="rc-num">20</span>
              <p>Chaque joueur dispose de <strong>20 pions</strong> placés sur les 4 premières rangées de son côté, sur les cases sombres.</p>
            </div>
          </div>
          <div class="visual-board">
            <div class="vb-row">
              <div v-for="c in 5" :key="c" class="vb-cell dark"><span class="vb-piece black"></span></div>
            </div>
            <div class="vb-row">
              <div v-for="c in 5" :key="c" class="vb-cell dark"><span class="vb-piece black"></span></div>
            </div>
            <div class="vb-row empty">
              <div v-for="c in 5" :key="c" class="vb-cell dark"></div>
            </div>
            <div class="vb-row empty">
              <div v-for="c in 5" :key="c" class="vb-cell dark"></div>
            </div>
            <div class="vb-row">
              <div v-for="c in 5" :key="c" class="vb-cell dark"><span class="vb-piece white"></span></div>
            </div>
            <div class="vb-row">
              <div v-for="c in 5" :key="c" class="vb-cell dark"><span class="vb-piece white"></span></div>
            </div>
          </div>
          <p class="caption">Disposition de départ (vue simplifiée)</p>
        </div>
      </section>

      <!-- DEPLACEMENT -->
      <section id="deplacement" class="section">
        <div class="section-header">
          <span class="section-icon">↗</span>
          <h2>Déplacement</h2>
        </div>
        <div class="section-body">
          <ul class="rule-list">
            <li>
              <span class="li-icon">▸</span>
              <span>Les Blancs jouent en premier. Les joueurs alternent ensuite à chaque tour.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>Un pion se déplace d'<strong>une case en diagonale vers l'avant</strong> uniquement, sur une case vide.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>Les Blancs avancent vers le haut du plateau, les Noirs vers le bas.</span>
            </li>
          </ul>
          <div class="highlight-box">
            <span class="hb-icon">💡</span>
            <p>Un pion ne peut <strong>jamais</strong> reculer, sauf s'il est promu en dame.</p>
          </div>
        </div>
      </section>

      <!-- PRISE -->
      <section id="prise" class="section">
        <div class="section-header">
          <span class="section-icon">✕</span>
          <h2>Prise</h2>
        </div>
        <div class="section-body">
          <ul class="rule-list">
            <li>
              <span class="li-icon">▸</span>
              <span>Un pion peut <strong>capturer</strong> un pion adverse en sautant par-dessus lui en diagonale, si la case derrière est libre.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>La prise peut se faire <strong>vers l'avant ou vers l'arrière</strong>.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span><strong>La prise est obligatoire</strong> : si une capture est possible, vous devez la jouer.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>Si plusieurs prises sont disponibles, vous pouvez en choisir <strong>une quelconque</strong>, mais devez capturer le <strong>maximum</strong> de pièces possible.</span>
            </li>
          </ul>
          <div class="highlight-box warning">
            <span class="hb-icon">⚠️</span>
            <p>Ne pas effectuer une prise obligatoire est une <strong>infraction</strong>. L'adversaire peut exiger que le coup soit rejoué.</p>
          </div>
        </div>
      </section>

      <!-- RAFFLE -->
      <section id="raffle" class="section">
        <div class="section-header">
          <span class="section-icon">⚡</span>
          <h2>La raffle (prise multiple)</h2>
        </div>
        <div class="section-body">
          <ul class="rule-list">
            <li>
              <span class="li-icon">▸</span>
              <span>Après une capture, si le pion peut en effectuer une autre immédiatement, il <strong>doit continuer</strong> à capturer dans le même tour.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>Les pièces capturées restent sur le plateau jusqu'à la <strong>fin de la raffle</strong>, puis sont retirées toutes ensemble.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>Un pion ne peut pas passer deux fois par la même case lors d'une raffle.</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- DAME -->
      <section id="dame" class="section">
        <div class="section-header">
          <span class="section-icon">👑</span>
          <h2>La dame</h2>
        </div>
        <div class="section-body">
          <ul class="rule-list">
            <li>
              <span class="li-icon">▸</span>
              <span>Un pion atteignant la <strong>dernière rangée</strong> adverse est <strong>promu en dame</strong>.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>La dame se déplace en diagonale dans les <strong>4 directions</strong>, sur n'importe quelle distance.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>La dame capture en sautant par-dessus un pion adverse à <strong>n'importe quelle distance</strong>, et peut s'arrêter sur n'importe quelle case derrière la pièce capturée.</span>
            </li>
            <li>
              <span class="li-icon">▸</span>
              <span>La prise est également <strong>obligatoire</strong> pour les dames.</span>
            </li>
          </ul>
          <div class="highlight-box success">
            <span class="hb-icon">👑</span>
            <p>La promotion n'a lieu qu'à la <strong>fin du coup</strong>. Si un pion atteint la dernière rangée lors d'une raffle, la raffle s'arrête et le pion est promu.</p>
          </div>
        </div>
      </section>

      <!-- FIN DE PARTIE -->
      <section id="fin" class="section">
        <div class="section-header">
          <span class="section-icon">🏆</span>
          <h2>Fin de partie</h2>
        </div>
        <div class="section-body">
          <div class="outcome-grid">
            <div class="outcome-card win">
              <span class="oc-icon">🏆</span>
              <h3>Victoire</h3>
              <p>L'adversaire n'a <strong>plus de pièces</strong>, ou il ne peut effectuer <strong>aucun mouvement légal</strong>.</p>
            </div>
            <div class="outcome-card draw">
              <span class="oc-icon">🤝</span>
              <h3>Nulle</h3>
              <p>Les deux joueurs s'accordent sur une nulle, ou après de <strong>nombreux coups</strong> sans capture ni avance de pion.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div class="cta-block">
        <p>Prêt à jouer ?</p>
        <NuxtLink to="/" class="cta-btn">← Retour à l'accueil</NuxtLink>
      </div>

    </div>
  </div>
</template>

<style>
body { overflow-y: auto; }
</style>

<style scoped>
.page {
  min-height: 100vh;
  background: #abaaaa;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  color: white;
}

.content {
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ── HERO ── */
.hero {
  text-align: center;
  padding: 2rem 0 1rem;
}

.hero-icon {
  font-size: 3.5rem;
  line-height: 1;
  margin-bottom: 0.6rem;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
}

.hero h1 {
  margin: 0 0 0.4rem;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-sub {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.55);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* ── TABLE OF CONTENTS ── */
.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.toc a {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
}
.toc a:hover { background: rgba(255,255,255,0.18); color: white; }

/* ── SECTIONS ── */
.section {
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.15);
}

.section-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.section-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.section-body {
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* ── RULE CARDS ── */
.rule-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.rule-card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rc-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: #e8e8e8;
  line-height: 1;
}

.rule-card p {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.55;
}

/* ── VISUAL BOARD ── */
.visual-board {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-self: center;
}

.vb-row {
  display: flex;
  gap: 3px;
}

.vb-cell {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(80,50,20,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vb-piece {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: block;
}

.vb-piece.black { background: #222; border: 2px solid rgba(255,255,255,0.25); }
.vb-piece.white { background: #e8e8e8; border: 2px solid rgba(0,0,0,0.2); }

.caption {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  text-align: center;
}

/* ── RULE LIST ── */
.rule-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.rule-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(255,255,255,0.82);
}

.li-icon {
  flex-shrink: 0;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
  font-size: 0.75rem;
}

/* ── HIGHLIGHT BOX ── */
.highlight-box {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  border-left: 3px solid rgba(255,255,255,0.3);
}

.highlight-box.warning {
  background: rgba(255,150,0,0.1);
  border-left-color: rgba(255,150,0,0.6);
}

.highlight-box.success {
  background: rgba(46,213,115,0.08);
  border-left-color: rgba(46,213,115,0.5);
}

.hb-icon { font-size: 1.1rem; flex-shrink: 0; line-height: 1.4; }

.highlight-box p {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.55;
}

/* ── OUTCOME GRID ── */
.outcome-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.outcome-card {
  border-radius: 14px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.outcome-card.win  { background: rgba(46,213,115,0.1);  border: 1px solid rgba(46,213,115,0.25); }
.outcome-card.draw { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); }

.oc-icon { font-size: 1.4rem; line-height: 1; }

.outcome-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.outcome-card p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.5;
}

/* ── CTA ── */
.cta-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  text-align: center;
}

.cta-block p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}

.cta-btn {
  padding: 0.75rem 1.8rem;
  background: #b0b0b0;
  color: #111;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}
.cta-btn:hover { background: #c8c8c8; transform: scale(1.02); }

/* ── RESPONSIVE ── */
@media (max-width: 540px) {
  .content { padding: 1.5rem 1rem 3rem; gap: 1.8rem; }
  .rule-cards   { grid-template-columns: 1fr; }
  .outcome-grid { grid-template-columns: 1fr; }
  .section-body { padding: 1.1rem 1rem; }
  .section-header { padding: 0.9rem 1rem; }
}
</style>
