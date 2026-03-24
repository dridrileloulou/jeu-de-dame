import { Player } from "./Player.js";

export class HumanPlayer extends Player {
  constructor(id, color, name) {
    super(id, color)
    this.name = name
  }

  playMove(move) {
    return move
  }
}
 
