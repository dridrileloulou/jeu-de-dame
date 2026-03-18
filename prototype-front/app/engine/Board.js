import {Piece} from './Piece.js';

/**
 * On class to represent the board of the game. 
 * 
 */

export class Board {

    // Initilises a board of 10x10 with 20 pawns
    constructor() {
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
        for (let j = 0; j < this.board.length; j++) {
            for (let i = 0; i < this.board[j].length; i++) {
                if (this.board[j][i] === 1) {
                    this.board[j][i] = new Piece("black", i, j);
                } else if (this.board[j][i] === 2) {
                    //this.placePion(new Pion(i, j, "white"));
                    this.board[j][i] = new Piece("white", i, j);
                } 
            }
        }
    }

    getPiece(x, y) {
        if (y < 0 || y >= 10 || x < 0 || x >= 10) {
            return null;
        }
        return this.board[y][x];
    }

    setPiece(x, y, piece) {
        this.board[y][x] = piece;
    }

    movePiece(oldPiece, newX, newY) {
        const piece = this.board[oldPiece.y][oldPiece.x];

        if (piece === 0) {
            console.log("Erreur: il n'y a pas de piece à l'endroit demandé");
            return;
        }

        this.board[newY][newX] = piece;
        this.board[oldPiece.y][oldPiece.x] = 0;

        piece.movePiece(newX, newY);

    }
}