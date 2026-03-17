import {Board} from './Board.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = "white"; // Default starting
        this.status = "playing"; // Can be "playing", "win_white", "win_black", "draw"
    }

    // Function to deal with the state: is called when an action is done (move a piece for instance)
    nextTurn() {
        if (this.checkGameOver()) {
            this.status = "finished";
            console.log("The game is over !");
            return;
        }

        // Changing the player
        this.currentPlayer = (this.currentPlayer === "white") ? "black" : "white";
        console.log(`It's ${this.currentPlayer}'s turn !`);

        // API AI here
        if (this.isAI(this.currentPlayer)) {
            this.playAITurn();
        }
    }

    checkGameOver() {
        // Check is the game is finished (not done)
        return false; 
    }
}