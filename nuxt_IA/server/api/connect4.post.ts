// server/api/connect4.post.ts
// Connect Four (Puissance 4) AI API for Nuxt 4 (Nitro)
// Levels: 1 = Beginner (leftmost column), 2 = Intermediate (random), 3 = Expert (Gemini powered)

import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Cell = 0 | 1 | 2; // 0 = empty, 1 = player, 2 = AI
type Board = Cell[][]; // 6 rows × 7 cols (rows indexed from bottom)

interface RequestBody {
    board: Board; // 6×7 matrix, bottom row index 0
    level: number; // 1, 2, or 3
}

// ---------- Helper functions (same as before) ----------
function cloneBoard(board: Board): Board {
    return board.map(row => [...row]) as Board;
}
function dropDisc(board: Board, col: number, player: Cell): Board | null {
    const newBoard = cloneBoard(board);
    for (let r = 0; r < newBoard.length; r++) {
        if (newBoard[r][col] === 0) {
            newBoard[r][col] = player;
            return newBoard;
        }
    }
    return null; // column full
}
function isWinning(board: Board, player: Cell): boolean {
    const rows = board.length;
    const cols = board[0].length;
    // horizontal
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - 4; c++) {
            if (
                board[r][c] === player &&
                board[r][c + 1] === player &&
                board[r][c + 2] === player &&
                board[r][c + 3] === player
            ) return true;
        }
    }
    // vertical
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r <= rows - 4; r++) {
            if (
                board[r][c] === player &&
                board[r + 1][c] === player &&
                board[r + 2][c] === player &&
                board[r + 3][c] === player
            ) return true;
        }
    }
    // diagonal ↘
    for (let r = 0; r <= rows - 4; r++) {
        for (let c = 0; c <= cols - 4; c++) {
            if (
                board[r][c] === player &&
                board[r + 1][c + 1] === player &&
                board[r + 2][c + 2] === player &&
                board[r + 3][c + 3] === player
            ) return true;
        }
    }
    // diagonal ↙
    for (let r = 3; r < rows; r++) {
        for (let c = 0; c <= cols - 4; c++) {
            if (
                board[r][c] === player &&
                board[r - 1][c + 1] === player &&
                board[r - 2][c + 2] === player &&
                board[r - 3][c + 3] === player
            ) return true;
        }
    }
    return false;
}
function getValidColumns(board: Board): number[] {
    const cols = board[0].length;
    const valid: number[] = [];
    for (let c = 0; c < cols; c++) {
        if (board[board.length - 1][c] === 0) valid.push(c);
    }
    return valid;
}

// ---------- Prompt templates per level ----------
const PROMPTS = {
    beginner: (board: Board) => `
    \nYou are an AI playing Connect Four.
    \nThe board is a 6x7 matrix where 0 = empty, 1 = player, 2 = AI.
    \nHere is the current board (rows from bottom to top):\n${JSON.stringify(board)}
    \nChoose only among the legal columns and play a move without any strategic reasoning.
    \nRespond ONLY with a valid JSON object in this format: {"column": 3}`,

    intermediate: (board: Board) => `
    \nYou are an AI playing Connect Four.
    \nThe board is a 6x7 matrix where 0 = empty, 1 = player, 2 = AI.
    \nHere is the current board (rows from bottom to top):\n${JSON.stringify(board)}
    \nIf you can win this turn, play that winning move. If the opponent could win on their next turn, block that move. Avoid moves that would give the opponent an immediate winning column.
    \nBriefly explain your reasoning in 1 sentence, and then provide the column number.
    \nRespond ONLY with a valid JSON object in this exact format: {"reasoning": "...", "column": 3}`,

    expert: (board: Board) => `
    \nYou are a highly skilled AI playing Connect Four.
    \nThe board is a 6x7 matrix where 0 = empty, 1 = player, 2 = AI.
    \nHere is the current board (rows from bottom to top):\n${JSON.stringify(board)}
    \nAnalyze all potential threats, identify every possible line of four that could be formed, and anticipate at least two moves ahead. Prioritize playing in the center columns.
    \nProvide a very short strategic analysis (max 2 sentences), and then provide the column number.
    \nRespond ONLY with a valid JSON object in this exact format: {"analysis": "...", "column": 3}`,

    // Impossible: unbeatable AI, analyzes all future moves
    impossible: (board: Board) => `
    \nYou are an unbeatable AI playing Connect Four.
    \nThe board is a 6x7 matrix where 0 = empty, 1 = player, 2 = AI.
    \nHere is the current board (rows from bottom to top):\n${JSON.stringify(board)}
    \nAnalyze possible future move sequences, consider opponent responses, and choose the move that guarantees a win or block.
    \nExplain briefly (max 3 sentences), and provide the column number.
    \nRespond ONLY with a valid JSON object in this exact format: {"analysis": "...", "column": 3}`
};

// ---------- Call Gemini ----------
async function askGemini(board: Board, level: number): Promise<number> {
    const config = useRuntimeConfig();
    const apiKey = config.geminiApiKey;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Configuration pour optimiser la vitesse et obliger un parseable JSON
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.1, // Réduit les comportements imprévisibles
            responseMimeType: "application/json", // Force une réponse 100% JSON valide
        }
    });

    // select prompt based on level
    let prompt: string;
    if (level === 1) prompt = PROMPTS.beginner(board);
    else if (level === 2) prompt = PROMPTS.intermediate(board);
    else if (level === 4) prompt = PROMPTS.impossible(board);
    else prompt = PROMPTS.expert(board);

    // try up to 3 times to get a valid column from Gemini
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const text = await result.response.text();

            // On parse le JSON retourné par Gemini
            let parsed;
            try {
                parsed = JSON.parse(text.trim());
            } catch (jsonErr) {
                console.warn(`[Attempt ${attempt + 1}] JSON format error. Raw: \n${text}`);
                continue; // retry
            }

            const col = Number(parsed.column);
            const valid = getValidColumns(board);

            if (!Number.isNaN(col) && valid.includes(col)) {
                if (level > 1) {
                    console.log(`🤖 IA (Lvl ${level}) reasoning :`, parsed.reasoning || parsed.analysis);
                }
                return col;
            } else {
                console.warn(`[Attempt ${attempt + 1}] Invalid column chosen: ${col}. Valid were: ${valid}`);
            }
        } catch (e) {
            console.error('Gemini error (attempt', attempt + 1, '):', e);
        }
        // retry with same prompt
    }

    // fallback: deterministic for level 1, random otherwise
    if (level === 1) {
        const valid = getValidColumns(board);
        return valid.length ? valid[0] : -1;
    }
    return -1; // No offline fallback, rely solely on Gemini
}



export default defineEventHandler(async (event) => {
    const start = Date.now();
    const body = await readBody<RequestBody>(event);
    const { board, level } = body;
    const col = await askGemini(board, level);
    const duration = Date.now() - start;
    console.log(`[Connect4 AI] Move played in ${duration}ms (Level: ${level})`);
    return { aiColumn: col, durationMs: duration };
});
