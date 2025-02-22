export interface User {
  id: string
  username?: string
  email: string
  avatar?: string
  avatar_url?: string
  status: 'online' | 'offline' | 'busy'
}

export interface Message {
  id: string
  content: string
  user_id: string
  sender?: User
  channel_id?: string
  dm_id?: string
  created_at: string
  reactions: Reaction[]
  is_ai?: boolean
  recallScore?: number
}

export interface Reaction {
  id: string
  emoji: string
  user_id: string
  message_id: string
  reactor?: User
}

export interface Channel {
  id: string
  name: string
  workspace_id: string
  messages: Message[]
}

export interface DirectMessage {
  id: string
  workspace_id: string
  participants: User[]
  messages: Message[]
}

export interface Workspace {
  id: string
  name: string
  users: User[]
  channels: Channel[]
  directMessages: DirectMessage[]
}

