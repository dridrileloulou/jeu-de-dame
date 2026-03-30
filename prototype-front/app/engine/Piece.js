export class Piece {
    constructor(color, x, y) {
        this.color = color; // "white" or "black"
        this.x = x;
        this.y = y;
        this.isDraught = false; // Becomes true if the piece reaches the opposite side
    }

    // Change this piece into a King (Draught)
    promote() {
        this.isDraught = true;
    }

    // Update the piece internal coordinates
    movePiece(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}