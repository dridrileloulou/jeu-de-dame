type Cell = 0 | 1 | 2;
type Board = Cell[][];

function getLegalMovesFallback(board: Board, player: Cell) {
    const moves: {from: number[], to: number[], isCapture: boolean}[] = [];
    const dy = player === 1 ? 1 : -1;
    const opponent = player === 1 ? 2 : 1;
    let hasCapture = false;

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (board[y][x] !== player) continue;
            
            for (const dx of [-1, 1]) {
                const ny2 = y + 2*dy, nx2 = x + 2*dx;
                if (ny2 >= 0 && ny2 < 10 && nx2 >= 0 && nx2 < 10) {
                    if (board[y+dy][x+dx] === opponent && board[ny2][nx2] === 0) {
                        if (!hasCapture) { moves.length = 0; hasCapture = true; }
                        moves.push({ from: [y, x], to: [ny2, nx2], isCapture: true });
                    }
                }
                if (!hasCapture) {
                    const ny = y + dy, nx = x + dx;
                    if (ny >= 0 && ny < 10 && nx >= 0 && nx < 10 && board[ny][nx] === 0) {
                        moves.push({ from: [y, x], to: [ny, nx], isCapture: false });
                    }
                }
            }
        }
    }
    return moves;
}

function evaluateBoard(board: Board, aiPlayer: Cell) {
    let score = 0;
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (board[y][x] === aiPlayer) score += 10;
            else if (board[y][x] !== 0) score -= 10;
        }
    }
    return score;
}

function minimax(board: Board, depth: number, isMax: boolean, aiPlayer: Cell, alpha: number, beta: number): number {
    if (depth === 0) return evaluateBoard(board, aiPlayer);
    
    const currPlayer = isMax ? aiPlayer : (aiPlayer === 1 ? 2 : 1);
    const moves = getLegalMovesFallback(board, currPlayer);
    if (moves.length === 0) return isMax ? -1000 : 1000;

    let bestVal = isMax ? -Infinity : Infinity;
    for (const move of moves) {
        const newBoard = board.map(row => [...row]);
        newBoard[move.to[0]][move.to[1]] = currPlayer;
        newBoard[move.from[0]][move.from[1]] = 0;
        if (move.isCapture) newBoard[(move.from[0] + move.to[0])/2][(move.from[1] + move.to[1])/2] = 0;
        
        const ev = minimax(newBoard, depth - 1, !isMax, aiPlayer, alpha, beta);
        if (isMax) {
            bestVal = Math.max(bestVal, ev);
            alpha = Math.max(alpha, ev);
        } else {
            bestVal = Math.min(bestVal, ev);
            beta = Math.min(beta, ev);
        }
        if (beta <= alpha) break;
    }
    return bestVal;
}

export function getMinimaxFallbackMove(board: Board, aiPlayer: Cell, level: number): string | null {
    const moves = getLegalMovesFallback(board, aiPlayer);
    if (moves.length === 0) return null;
    
    let bestMove = moves[Math.floor(Math.random() * moves.length)];
    let bestVal = -Infinity;
    const depth = Math.min(level, 3); // Max depth 3 for performance in JS
    
    for (const move of moves) {
        const newBoard = board.map(row => [...row]);
        newBoard[move.to[0]][move.to[1]] = aiPlayer;
        newBoard[move.from[0]][move.from[1]] = 0;
        if (move.isCapture) newBoard[(move.from[0] + move.to[0])/2][(move.from[1] + move.to[1])/2] = 0;
        
        const moveVal = minimax(newBoard, depth - 1, false, aiPlayer, -Infinity, Infinity);
        if (moveVal > bestVal) {
            bestVal = moveVal;
            bestMove = move;
        }
    }
    return `${bestMove.from[0]},${bestMove.from[1]} ${bestMove.to[0]},${bestMove.to[1]}`;
}
