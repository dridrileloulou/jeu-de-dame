/**
 * A class to render the board in the console
 * To not keep in the final version, only to help visualisation for now
 */
export class Render {

    /**
     * Take a board and draw it in the console 
     * @param {Board} board 
     */
    drawConsole(board) {
        let view = new String("");
        for (let j = 0; j < board.length; j++) {
            for (let i = 0; i < board[j].length; i++) {
                if (board[j][i].color == "black") {
                    view = view + " 1 "
                } else if (board[j][i].color == "white") {
                    view = view + " 2 "
                } else {
                    view = view + " 0 "
                }
            }
            view = view + "\n";
        }
        console.log(view);
    }
}