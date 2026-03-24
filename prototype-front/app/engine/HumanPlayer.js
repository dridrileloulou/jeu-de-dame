const Player = require("./Player")

class HumanPlayer extends Player {
  constructor(id, color, name) {
    super(id, color)
    this.name = name
  }

  playMove(move) {
    return move
  }
}
 





module.exports = HumanPlayer