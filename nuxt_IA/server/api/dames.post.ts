// server/api/dames.post.ts
// Checkers (Dames) AI API for Nuxt 4 (Nitro)
// Levels: 1 = Beginner (random valid move), 2 = Intermediate, 3 = Expert, 4 = Impossible

import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMinimaxFallbackMove } from './algo_minimax';
type Cell = 0 | 1 | 2; // 0 = empty, 1 = player (Noirs), 2 = AI (Blancs)
type Board = Cell[][]; // 10x10 matrix

interface RequestBody {
    board: Board;
    level: number; // 1, 2, 3, or 4
    player?: Cell; // Defaults to 2 (Blancs) for the AI
}

// Helper to determine string
const getColorInstruction = (aiPlayer: Cell) => aiPlayer === 1
    ? "where 0 = empty, 2 = player (Blancs), 1 = AI (Noirs)"
    : "where 0 = empty, 1 = player (Noirs), 2 = AI (Blancs)";

// ---------- Helper functions removed (trusting AI) ----------
// ---------- Prompt templates per level ----------
const PROMPTS = {
    beginner: (board: Board, aiPlayer: Cell) => `
    \nYou are an AI playing Checkers (Dames).
    \nThe board is a ${board.length}x${board.length} matrix ${getColorInstruction(aiPlayer)}.
    \nHere is the current board:\n${JSON.stringify(board)}
    \nPlay a valid move. Format the move as "r1,c1 r2,c2" (row,col start to row,col end).
    \nChoose a single move VERY QUICKLY without any strategic reasoning. Do not overthink, answer immediately.
    \nRespond ONLY with a valid JSON object in this format: {"move": "6,1 5,2"}`,

    intermediate: (board: Board, aiPlayer: Cell) => `
    \nYou are an AI playing Checkers (Dames).
    \nThe board is a ${board.length}x${board.length} matrix ${getColorInstruction(aiPlayer)}.
    \nHere is the current board:\n${JSON.stringify(board)}
    \nPlay a valid move. Format the move as "r1,c1 r2,c2".
    \nIf you have a move that captures an opponent (a jump of 2 spaces), prioritize it. 
    \nPlay VERY QUICKLY and do not overthink. Briefly explain your reasoning in 1 very short sentence, and provide exactly one move.
    \nRespond ONLY with a valid JSON object in this exact format: {"analysis": "...", "move": "6,1 5,2"}`,

    expert: (board: Board, aiPlayer: Cell) => `
    \nYou are a highly skilled AI playing Checkers (Dames).
    \nThe board is a ${board.length}x${board.length} matrix ${getColorInstruction(aiPlayer)}.
    \nHere is the current board:\n${JSON.stringify(board)}
    \nPlay a valid move. Format the move as "r1,c1 r2,c2".
    \nAnalyze your position. You must prioritize captures (a jump of 2 spaces). Consider keeping your back row intact and advancing your pieces to become Kings.
    \nProvide a short strategic analysis (max 2 sentences), and provide exactly one move.
    \nRespond ONLY with a valid JSON object in this exact format: {"analysis": "...", "move": "6,1 5,2"}`,

    impossible: (board: Board, aiPlayer: Cell) => `
    \nYou are an unbeatable AI playing Checkers (Dames).
    \nThe board is a ${board.length}x${board.length} matrix ${getColorInstruction(aiPlayer)}.
    \nHere is the current board:\n${JSON.stringify(board)}
    \nPlay a valid move. Format the move as "r1,c1 r2,c2".
    \nAnticipate multiple moves ahead. Protect your pieces from getting captured, set up traps, and dominate the center of the board. Always prioritize capturing if available.
    \nExplain briefly (max 3 sentences), and provide precisely one move.
    \nRespond ONLY with a valid JSON object in this exact format: {"analysis": "...", "move": "6,1 5,2"}`
};

// ---------- Call Gemini ----------
async function askGemini(board: Board, level: number, aiPlayer: Cell): Promise<string | null> {
    const config = useRuntimeConfig();
    const apiKey = config.geminiApiKey;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    let prompt: string;
    if (level === 1) prompt = PROMPTS.beginner(board, aiPlayer);
    else if (level === 2) prompt = PROMPTS.intermediate(board, aiPlayer);
    else if (level === 4) prompt = PROMPTS.impossible(board, aiPlayer);
    else prompt = PROMPTS.expert(board, aiPlayer);

    // 2 tentatives max au lieu de 3
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            const text = await result.response.text();

            let parsed;
            try {
                parsed = JSON.parse(text.trim());
            } catch (jsonErr) {
                console.warn(`[Attempt ${attempt + 1}] JSON format error. Raw: \n${text}`);
                if (attempt === 0) {
                    await new Promise(r => setTimeout(r, 1000)); // Attendre 1s avant de réessayer
                }
                continue;
            }

            const move = parsed.move;

            if (move) {
                if (level > 1) {
                    console.log(`🤖 IA Dames (Lvl ${level}) reasoning :`, parsed.reasoning || parsed.analysis);
                }
                return move;
            } else {
                console.warn(`[Attempt ${attempt + 1}] Invalid move format chosen: ${move}.`);
                if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e: any) {
            console.error(`Gemini error (attempt ${attempt + 1}):`, e.message);
            if (attempt === 0) {
                // 1 seule seconde d'attente pour le Retry
                console.log(`⏳ Erreur API : attente de 1s avant un dernier essai...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // fallback if AI completely failed formatting
    return null;
}

export default defineEventHandler(async (event) => {
    const start = Date.now();
    const body = await readBody<RequestBody>(event);
    const { board, level, player, useMinimaxOnly } = body;
    const aiPlayer = player ?? 2;

    let move;
    if (useMinimaxOnly) {
        console.log(`[Minimax Override] Calcul de la meilleure capture (profondeur ${level})...`);
        move = getMinimaxFallbackMove(board, aiPlayer, level);
    } else {
        move = await askGemini(board, level, aiPlayer);
        
        // Fallback: If Gemini failed after 2 retries (Quota/503), use local Minimax
        if (!move) {
            console.warn(`[Fallback] Gemini a échoué. Utilisation de l'algorithme Minimax local (profondeur ${level})...`);
            move = getMinimaxFallbackMove(board, aiPlayer, level);
        }
    }

    const duration = Date.now() - start;
    console.log(`[Dames AI] Move played in ${duration}ms (Level: ${level})`);

    return { aiMove: move, durationMs: duration };
});
