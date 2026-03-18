// Movement.js
export class Movement {
    /**
     * Function to obtain all the valid moves of the pice in parameter 
     * @param {Object} boardObj - Take an instance of a board
     * @param {Object} piece - Take an instance of a piece
     * @returns {Array} - An array of all the valid moves
     */
    static getValidMoves(boardObj, piece) {
        if (piece.isDraught) {
            return this.getDraughtMoves(boardObj, piece);
        } else {
            return this.getPawnMoves(boardObj, piece);
        }
    }

    static getPawnMoves(boardObj, piece) {
        const moves = [];
        // White are going up and blacks down
        const directionY = piece.color === 'white' ? -1 : 1;
        
        const targetY = piece.y + directionY;
        const possibleX = [piece.x - 1, piece.x + 1];

        possibleX.forEach(targetX => {
            // To verify if we go out of the board 
            if (this.isValidPosition(targetX, targetY)) {
                if (boardObj.getPiece(targetX, targetY) === 0) {
                    moves.push({ x: targetX, y: targetY });
                }
            }
        });

        return moves;
    }

    static getDraughtMoves(boardObj, piece) {
        const moves = [];
        // 4-possibles directions
        const directions = [
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        directions.forEach(dir => {
            let currentX = piece.x + dir.dx;
            let currentY = piece.y + dir.dy;

            while (this.isValidPosition(currentX, currentY)) {
                if (boardObj.getPiece(currentX, currentY) === 0) {
                    moves.push({ x: currentX, y: currentY });
                } else {
                    break; 
                }
                currentX += dir.dx;
                currentY += dir.dy;
            }
        });

        return moves;
    }

    // To verify if a position is outside the board
    static isValidPosition(x, y) {
        return x >= 0 && x < 10 && y >= 0 && y < 10;
    }
}