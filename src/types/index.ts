export interface User {
  id: string
  email: string
  avatar_url?: string | null
  status: 'online' | 'offline' | 'busy'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  content: string
  user_id: string
  channel_id?: string
  dm_id?: string
  created_at: string
  updated_at: string
  user: User
  reactions?: Reaction[]
}

export interface Channel {
  id: string
  workspace_id: string
  name: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface DirectMessage {
  id: string
  workspace_id: string
  created_at: string
  participants: User[]
  messages?: Message[]
}

export interface Workspace {
  id: string
  name: string
  created_at: string
  updated_at: string
  users: User[]
  channels: Channel[]
  directMessages: DirectMessage[]
}

export interface Reaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
  user: User
} 