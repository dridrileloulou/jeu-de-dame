export class Movement {

    // Main function to see where a piece can go
    static getValidMoves(boardObj, piece) {
        if (piece.isDraught) {
            return this.getDraughtMoves(boardObj, piece); // King logic
        } else {
            return this.getPawnMoves(boardObj, piece); // Normal pawn logic
        }
    }

    static getPawnMoves(boardObj, piece) {
        const moves = [];
        const enemyColor = piece.color === 'white' ? 'black' : 'white';

        // Normal diagonal move (only forward)
        const directionY = piece.color === 'white' ? -1 : 1;
        const simpleTargets = [{ x: piece.x - 1, y: piece.y + directionY }, { x: piece.x + 1, y: piece.y + directionY }];

        simpleTargets.forEach(t => {
            if (this.isValidPosition(t.x, t.y) && boardObj.getPiece(t.x, t.y) === 0) {
                moves.push({ x: t.x, y: t.y, type: 'move' });
            }
        });

        // Jumps (can jump in all 4 directions)
        const directions = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];

        directions.forEach(dir => {
            const victimX = piece.x + dir.dx;
            const victimY = piece.y + dir.dy;
            const jumpX = piece.x + (dir.dx * 2);
            const jumpY = piece.y + (dir.dy * 2);

            if (this.isValidPosition(jumpX, jumpY)) {
                const victim = boardObj.getPiece(victimX, victimY);
                const landing = boardObj.getPiece(jumpX, jumpY);

                // Rule: If next square is an enemy and the square after is empty, you can jump
                if (victim !== 0 && victim.color === enemyColor && landing === 0) {
                    moves.push({ x: jumpX, y: jumpY, type: 'capture', capturedX: victimX, capturedY: victimY });
                }
            }
        });
        return moves;
    }

    static getDraughtMoves(boardObj, piece) {
        const moves = [];
        const enemyColor = piece.color === 'white' ? 'black' : 'white';
        const directions = [{ dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }];

        directions.forEach(dir => {
            let cx = piece.x + dir.dx;
            let cy = piece.y + dir.dy;
            let hasJumped = false;
            let victimPos = null;

            // A King can slide across many empty squares
            while (this.isValidPosition(cx, cy)) {
                const cell = boardObj.getPiece(cx, cy);

                if (!hasJumped) {
                    if (cell === 0) {
                        moves.push({ x: cx, y: cy, type: 'move' }); // Simple slide
                    } else if (cell.color === enemyColor) {
                        // Enemy found! Check the square behind it to jump
                        const nextX = cx + dir.dx;
                        const nextY = cy + dir.dy;
                        if (this.isValidPosition(nextX, nextY) && boardObj.getPiece(nextX, nextY) === 0) {
                            hasJumped = true;
                            victimPos = { x: cx, y: cy };
                            cx = nextX; cy = nextY; // Move to the landing square
                            moves.push({ x: cx, y: cy, type: 'capture', capturedX: victimPos.x, capturedY: victimPos.y });
                            continue; 
                        } else { break; } // Path blocked
                    } else { break; } // Friend piece blocked
                } else {
                    // After a jump, a King can land on any empty square behind the victim
                    if (cell === 0) {
                        moves.push({ x: cx, y: cy, type: 'capture', capturedX: victimPos.x, capturedY: victimPos.y });
                    } else { break; }
                }
                cx += dir.dx; cy += dir.dy;
            }
        });
        return moves;
    }

    // This is the most important rule: if you CAN jump, you MUST jump.
    static getLegalMovesForPlayer(boardObj, color) {
        let allPossibleMoves = [];
        let hasCapture = false;

        // Scan the whole board to find all moves for the player
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const piece = boardObj.getPiece(x, y);
                if (piece !== 0 && piece.color === color) {
                    const moves = this.getValidMoves(boardObj, piece);
                    moves.forEach(m => {
                        m.from = { x, y }; // Remember where the move started
                        allPossibleMoves.push(m);
                        if (m.type === 'capture') hasCapture = true;
                    });
                }
            }
        }

        // Mandatory jump rule: if any capture is found, delete all simple moves
        if (hasCapture) {
            return allPossibleMoves.filter(m => m.type === 'capture');
        }

        return allPossibleMoves;
    }

    // Check if (x, y) is inside the 10x10 board
    static isValidPosition(x, y) {
        return x >= 0 && x < 10 && y >= 0 && y < 10;
    }
}