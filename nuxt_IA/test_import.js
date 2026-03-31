async function test() {
  try {
    const { Board } = await import('../prototype-front/app/engine/Board.js');
    const b = new Board();
    console.log("Success:", b.board[0][1]);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
