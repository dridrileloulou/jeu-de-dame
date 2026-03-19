<template>
  <div class="board">
    <div v-for="row in 10" :key="row" class="row">
      <div
        v-for="col in 10"
        :key="col"
        class="cell"
        :class="{
          dark: (row + col) % 2 === 0,
          light: (row + col) % 2 !== 0,
          shadowed: row === 4 && col === 4
        }"
      >
        <!-- Pions noirs (lignes 1-4) -->
        <div
          v-if="(row + col) % 2 === 0 && row <= 3"
          class="piece black"
          :class="{ selected: selected?.row === row && selected?.col === col }"
          @click="selected = { row, col }"
        />
        <!-- Pions blancs (lignes 7-10) -->
        <div
          v-if="(row + col) % 2 === 0 && row >= 8"
          class="piece white"
          :class="{ selected: selected?.row === row && selected?.col === col }"
          @click="selected = { row, col }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const selected = ref(null)
</script>

<style scoped>
.board {
  display: inline-block;
  border: 5px solid #0a0a0a;
}

.row {
  display: flex;
}

.cell {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark  { background-color: #8B4513; }
.light { background-color: #F5DEB3; }

.shadowed {
  position: relative;
}

.shadowed::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: rgba(2, 2, 2, 0.5);
  z-index: 1;
}

.piece {
  width: 75px; 
  height: 75px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.3);
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.4);
}

.piece.black { background: radial-gradient(circle at 35% 35%, #555, #111); }
.piece.white { background: radial-gradient(circle at 35% 35%, #fff, #ccc); }

.piece.selected {
  box-shadow: 0 0 12px 4px gold, inset 0 -4px 6px rgba(0,0,0,0.3);
  transform: scale(1.1);
}
</style>