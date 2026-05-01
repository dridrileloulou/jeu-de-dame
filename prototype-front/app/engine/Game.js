import { Board } from './Board.js'
import { Movement } from './Movement.js'
import { Piece } from './Piece.js'

export class Game {
  constructor() {
    this.board = new Board()
    this.currentPlayer = 'white'
    this._selected = null
    this._validMoves = []
    this._mandatoryPositions = []
    this._updateMandatory()
  }

  // ── State queries ──────────────────────────────────────────────────────────

  getPiece(x, y) {
    const p = this.board.getPiece(x, y)
    return (p === 0 || p == null) ? null : p
  }

  isSelected(row, col) {
    return this._selected?.row === row && this._selected?.col === col
  }

  isValidMove(row, col) {
    return this._validMoves.some(m => m.x === col && m.y === row)
  }

  isMandatory(row, col) {
    return this._mandatoryPositions.includes(`${col}_${row}`)
  }

  get hasMandatory() {
    return this._mandatoryPositions.length > 0
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Select a piece at (row, col) for the given color (defaults to currentPlayer).
   * Returns true if the selection was valid.
   */
  selectPiece(row, col, allowedColor = null) {
    const color = allowedColor ?? this.currentPlayer
    const piece = this.getPiece(col, row)
    if (!piece || piece.color !== color) return false
    if (this.hasMandatory && !this.isMandatory(row, col)) return false

    this._selected = { row, col }
    const legal = Movement.getLegalMovesForPlayer(this.board, piece.color)
    this._validMoves = legal.filter(m => m.from.x === col && m.from.y === row)
    return true
  }

  /**
   * Execute the move to (toRow, toCol).
   * Returns { from, to, captured, continuation, nextPlayer } or null if invalid.
   */
  executeMove(toRow, toCol) {
    if (!this._selected || !this.isValidMove(toRow, toCol)) return null

    const fromX = this._selected.col
    const fromY = this._selected.row
    const piece = this.getPiece(fromX, fromY)
    if (!piece) return null

    const md = this._validMoves.find(m => m.x === toCol && m.y === toRow)
    this.board.movePiece(piece, toCol, toRow)

    let captured = null
    if (md?.type === 'capture') {
      const cap = this.board.getPiece(md.capturedX, md.capturedY)
      if (cap && cap !== 0) this.board.setPiece(md.capturedX, md.capturedY, 0)
      captured = { x: md.capturedX, y: md.capturedY }

      // Raffle: check if the piece can capture again immediately
      const updated = this.board.getPiece(toCol, toRow)
      const nextLegal = Movement.getLegalMovesForPlayer(this.board, updated.color)
      const nextCaps = nextLegal.filter(m => m.from.x === toCol && m.from.y === toRow && m.type === 'capture')

      if (nextCaps.length > 0) {
        this._selected = { row: toRow, col: toCol }
        this._validMoves = nextCaps
        this._mandatoryPositions = [`${toCol}_${toRow}`]
        return { from: { x: fromX, y: fromY }, to: { x: toCol, y: toRow }, captured, continuation: true, nextPlayer: this.currentPlayer }
      }
    }

    const next = this.currentPlayer === 'white' ? 'black' : 'white'
    this._selected = null
    this._validMoves = []
    this.currentPlayer = next
    this._updateMandatory()
    return { from: { x: fromX, y: fromY }, to: { x: toCol, y: toRow }, captured, continuation: false, nextPlayer: next }
  }

  /**
   * Apply an opponent's move (online mode).
   */
  applyMove(from, to, captured, continuation, nextPlayer) {
    const piece = this.getPiece(from.x, from.y)
    if (!piece) return
    this.board.movePiece(piece, to.x, to.y)
    if (captured) this.board.setPiece(captured.x, captured.y, 0)
    if (!continuation) {
      this.currentPlayer = nextPlayer
      this._updateMandatory()
    }
  }

  /**
   * Returns the winner color if the current player has no moves, null otherwise.
   */
  checkWinner() {
    const moves = Movement.getLegalMovesForPlayer(this.board, this.currentPlayer)
    if (moves.length === 0) return this.currentPlayer === 'white' ? 'black' : 'white'
    return null
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize() {
    return this.board.board.map(row =>
      row.map(cell => cell === 0 ? null : { color: cell.color, isDraught: cell.isDraught })
    )
  }

  static restore(boardData, currentPlayer) {
    const g = new Game()
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = boardData[y][x]
        if (!cell) {
          g.board.board[y][x] = 0
        } else {
          const p = new Piece(cell.color, x, y)
          p.isDraught = cell.isDraught
          g.board.board[y][x] = p
        }
      }
    }
    g.currentPlayer = currentPlayer
    g._selected = null
    g._validMoves = []
    g._updateMandatory()
    return g
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  _updateMandatory() {
    const moves = Movement.getLegalMovesForPlayer(this.board, this.currentPlayer)
    const set = new Set()
    if (moves.some(m => m.type === 'capture'))
      moves.forEach(m => { if (m.type === 'capture') set.add(`${m.from.x}_${m.from.y}`) })
    this._mandatoryPositions = [...set]
  }
}
