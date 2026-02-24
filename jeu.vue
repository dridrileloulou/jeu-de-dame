<template>
  <div class="game">
    <h1>Plateau</h1>

    <div class="board">
      <div 
        v-for="index in 64" 
        :key="index"
        :class="[
          'square',
          (Math.floor((index-1)/8) + (index-1)%8) % 2 === 0 ? 'light' : 'dark'
        ]"
      ></div>
    </div>

    <NuxtLink to="/" class="back">Retour</NuxtLink>
  </div>
</template>

<style scoped>
.game {
  min-height: 100vh;
  background: #1e1e2f;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-family: Arial, sans-serif;
}

.board {
  display: grid;
  grid-template-columns: repeat(8, 70px);
  grid-template-rows: repeat(8, 70px);
  margin: 2rem 0;
  border: 5px solid #333;
}

.square {
  width: 70px;
  height: 70px;
}

.light {
  background: #f0d9b5;
}

.dark {
  background: #b58863;
}

.back {
  color: white;
}
</style>