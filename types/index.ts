export interface User {
  id: string
  username: string
  avatar: string
  status: 'online' | 'offline' | 'busy'
}

export interface Message {
  id: string
  content: string
  timestamp: string
  user: User
  reactions: Reaction[]
  user_id?: string
  channel_id?: string
  dm_id?: string
}

export interface Reaction {
  id: string
  emoji: string
  users: string[]
  message_id: string
  user_id: string
  user?: User
}

export interface UserPresence {
  user_id: string
  status: 'online' | 'offline' | 'busy'
  last_seen: string
}

export interface Channel {
  id: string
  name: string
  messages: Message[]
}

export interface DirectMessage {
  id: string
  participants: string[]
  messages: Message[]
}

export interface Workspace {
  id: string
  name: string
  channels: Channel[]
  directMessages: DirectMessage[]
  users: User[]
}

