export type User = {
  id: string
  username: string
  avatar: string
  status: 'online' | 'offline' | 'busy'
  password: string
}

export type Message = {
  id: string
  content: string
  timestamp: string
  user: User
  reactions: {
    emoji: string
    users: string[]
  }[]
}

export type Channel = {
  id: string
  name: string
  messages: Message[]
}

export type DirectMessage = {
  id: string
  participants: [string, string] // Array of two user IDs
  messages: Message[]
}

export type Workspace = {
  id: string
  name: string
  channels: Channel[]
  directMessages: DirectMessage[]
  users: User[]
}

