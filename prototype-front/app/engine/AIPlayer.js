const Player = require("./Player")

class AIPlayer extends Player {
  constructor(id, color, difficulty) {
    super(id, color) //initialise 
    this.difficulty = difficulty
  }

  playMove(aiMove) {
    return aiMove
  }
}


 


module.exports = AIPlayer