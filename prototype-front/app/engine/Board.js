import {Piece} from './Piece.js';

export class Board {
    constructor() {
        // Create a 10x10 grid with starting positions
        // 0 = empty, 1 = black, 2 = white
        this.board = [
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
        ];

        // Replace numbers (1 and 2) with real Piece objects
        for (let j = 0; j < 10; j++) {
            for (let i = 0; i < 10; i++) {
                if (this.board[j][i] === 1) {
                    this.board[j][i] = new Piece("black", i, j);
                } else if (this.board[j][i] === 2) {
                    this.board[j][i] = new Piece("white", i, j);
                } 
            }
        }
    }

    // Return the piece at (x, y) or null if out of bounds
    getPiece(x, y) {
        if (y < 0 || y >= 10 || x < 0 || x >= 10) return null;
        return this.board[y][x];
    }

    // Set a piece (or 0 for empty) at a specific position
    setPiece(x, y, piece) {
        this.board[y][x] = piece;
    }

    // Move a piece from its old spot to a new one
    movePiece(piece, newX, newY) {
        this.board[newY][newX] = piece; // Put piece in new spot
        this.board[piece.y][piece.x] = 0; // Empty the old spot
        piece.movePiece(newX, newY); // Tell the piece its new coordinates
    }
}