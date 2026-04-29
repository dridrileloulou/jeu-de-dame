export type TimerOption = 'none' | '10min' | '5min' | 'custom'
export type ColorOption = 'white' | 'black' | 'random'

export interface RoomParams {
  timer: TimerOption
  customSeconds?: number
  creatorColor: ColorOption
}

export interface Room {
  code: string
  creatorId: string
  creatorName: string
  joinerId?: string
  joinerName?: string
  params: RoomParams
  creatorColor?: 'white' | 'black'
  joinerColor?: 'white' | 'black'
  status: 'waiting' | 'playing' | 'finished'
  peerCreator?: any
  peerJoiner?: any
  createdAt: number
}

const rooms = new Map<string, Room>()

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function createRoom(creatorId: string, creatorName: string, params: RoomParams): Room {
  let code: string
  do { code = generateCode() } while (rooms.has(code))
  const room: Room = { code, creatorId, creatorName, params, status: 'waiting', createdAt: Date.now() }
  rooms.set(code, room)
  setTimeout(() => rooms.delete(code), 2 * 60 * 60 * 1000)
  return room
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code)
}

export { rooms }
