import { rooms } from '../../utils/rooms'

function resolveColor(creatorColor: string): 'white' | 'black' {
  if (creatorColor === 'random') return Math.random() < 0.5 ? 'white' : 'black'
  return creatorColor as 'white' | 'black'
}

function timerSeconds(timer: string, custom?: number): number {
  if (timer === 'none') return 0
  if (timer === '10min') return 600
  if (timer === '5min') return 300
  return custom || 300
}

export default defineWebSocketHandler({
  open(_peer) {},

  message(peer, msg) {
    let data: any
    try { data = JSON.parse(msg.text()) } catch { return }

    // ── Identification initiale ──────────────────────────────────────────────
    if (data.type === 'init') {
      const code = data.code?.toUpperCase()
      const room = rooms.get(code)
      if (!room) { peer.send(JSON.stringify({ type: 'error', message: 'Partie introuvable' })); return }

      const isCreator = room.creatorId === data.userId
      const isJoiner  = room.joinerId  === data.userId
      if (!isCreator && !isJoiner) { peer.send(JSON.stringify({ type: 'error', message: 'Non autorisé' })); return }

      if (isCreator) room.peerCreator = peer
      else           room.peerJoiner  = peer

      // Les deux joueurs sont connectés → lancement
      if (room.peerCreator && room.peerJoiner && room.status === 'waiting') {
        room.status = 'playing'
        const cc = resolveColor(room.params.creatorColor)
        room.creatorColor = cc
        room.joinerColor  = cc === 'white' ? 'black' : 'white'
        const secs = timerSeconds(room.params.timer, room.params.customSeconds)

        room.peerCreator.send(JSON.stringify({ type: 'start', color: room.creatorColor, timerSeconds: secs }))
        room.peerJoiner.send(JSON.stringify({ type: 'start', color: room.joinerColor,  timerSeconds: secs }))
      } else {
        peer.send(JSON.stringify({ type: 'waiting' }))
      }
      return
    }

    // ── Coup joué ────────────────────────────────────────────────────────────
    if (data.type === 'move') {
      const room = rooms.get(data.code?.toUpperCase())
      if (!room || room.status !== 'playing') return
      const other = room.peerCreator === peer ? room.peerJoiner : room.peerCreator
      if (other) other.send(msg.text())
      return
    }

    // ── Abandon / Temps écoulé ────────────────────────────────────────────────
    if (data.type === 'resign' || data.type === 'time_up') {
      const room = rooms.get(data.code?.toUpperCase())
      if (!room || room.status !== 'playing') return
      const isCreator = room.peerCreator === peer
      const myColor   = isCreator ? room.creatorColor : room.joinerColor
      const winner    = myColor === 'white' ? 'black' : 'white'
      const reason    = data.type === 'time_up' ? 'time' : 'resign'
      const end = JSON.stringify({ type: 'end', winner, reason })
      if (room.peerCreator) room.peerCreator.send(end)
      if (room.peerJoiner)  room.peerJoiner.send(end)
      room.status = 'finished'
    }
  },

  close(peer) {
    for (const [, room] of rooms) {
      const isCreator = room.peerCreator === peer
      const isJoiner  = room.peerJoiner  === peer
      if (!isCreator && !isJoiner) continue

      if (room.status === 'playing') {
        const other = isCreator ? room.peerJoiner : room.peerCreator
        if (other) other.send(JSON.stringify({ type: 'opponent_disconnected' }))
        room.status = 'finished'
      }
      if (isCreator) room.peerCreator = undefined
      else           room.peerJoiner  = undefined
      break
    }
  }
})
