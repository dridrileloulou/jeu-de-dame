import { Player } from "./Player.js";

export class AIPlayer extends Player {
  constructor(id, color, difficulty) {
    super(id, color) //initialise 
    this.difficulty = difficulty
  }

  playMove(aiMove) {
    return aiMove
  }
}


 
