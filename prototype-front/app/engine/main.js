// File to test classes

// Imports
import {Game} from './Game.js';
import {Board} from './Board.js';
import {Render} from './Render.js';
import {Piece} from './Piece.js';
import {Movement} from './Movement.js';

// Events
document.addEventListener("keydown", handleSpaceDown);

// Initialisation of a game
let testGame = new Game();

// Initialisation of the renderer (only in console since it is done by the framework later)
let RenderBoard = new Render();

RenderBoard.drawConsole(testGame.board.board);

let testPawn = testGame.board.getPiece(1,6);

console.log(testPawn)

let moves = Movement.getPawnMoves(testGame.board, testPawn);

console.log(moves)

testGame.board.movePiece(testPawn, 4, 4)

testPawn.movePiece(4,4);

RenderBoard.drawConsole(testGame.board.board);

function handleSpaceDown(e) {
    if (e.key == " ") {
        console.log("test");
    }
}

