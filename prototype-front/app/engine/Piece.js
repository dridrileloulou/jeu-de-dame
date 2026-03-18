/**
 * A class to modelize a piece in the game. 
 */
export class Piece  {
    /**
     * Constructor of a piece
     * By default, a piece is not a Draught
     * @param {String} color 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(color, x, y) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.isDraught = false;
    }
    
    movePiece(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    promote() {
        this.isDraught = true;
    }
}