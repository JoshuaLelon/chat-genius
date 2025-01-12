"use client"

import { Channel, DirectMessage, Message, User, Workspace } from "@/types"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface MessagePayload {
  id: string
  content: string
  user_id: string
  channel_id?: string
  dm_id?: string
  created_at: string
  updated_at: string
}

interface PresenceState {
  [key: string]: {
    user_id: string
    status: 'online' | 'offline' | 'busy'
  }[]
}

interface ChatContextType {
  workspace: Workspace
  currentUser: User
  addMessage: (channelId: string | null, dmUserId: string | null, content: string) => Promise<void>
  updateMessage: (channelId: string | null, dmUserId: string | null, messageId: string, content: string) => Promise<void>
  removeMessage: (channelId: string | null, dmUserId: string | null, messageId: string) => Promise<void>
  updateUserStatus: (status: 'online' | 'offline' | 'busy') => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

function convertPayloadToMessage(payload: MessagePayload, workspace: Workspace): Message {
  const user = workspace.users.find(u => u.id === payload.user_id)
  if (!user) throw new Error(`User ${payload.user_id} not found in workspace`)
  
  return {
    id: payload.id,
    content: payload.content,
    timestamp: payload.created_at,
    user,
    reactions: [] // We'll handle reactions in a separate subscription
  }
}

export function ChatProvider({ children, initialWorkspace, currentUser }: { children: React.ReactNode; initialWorkspace: Workspace; currentUser: User }) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const router = useRouter()

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to channel messages
    const channelMessagesSubscription = supabase
      .channel('channel-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=in.(${workspace.channels.map(c => c.id).join(',')})`
        },
        (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
          setWorkspace(prevWorkspace => {
            const newWorkspace = { ...prevWorkspace }

            if (payload.eventType === 'INSERT' && payload.new) {
              const channelId = payload.new.channel_id
              if (channelId) {
                const channelIndex = newWorkspace.channels.findIndex(c => c.id === channelId)
                if (channelIndex !== -1) {
                  try {
                    const message = convertPayloadToMessage(payload.new, newWorkspace)
                    newWorkspace.channels[channelIndex].messages.push(message)
                  } catch (error) {
                    console.error('Error converting message payload:', error)
                  }
                }
              }
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const channelId = payload.new.channel_id
              if (channelId) {
                const channelIndex = newWorkspace.channels.findIndex(c => c.id === channelId)
                if (channelIndex !== -1) {
                  const messageIndex = newWorkspace.channels[channelIndex].messages.findIndex(m => m.id === payload.new.id)
                  if (messageIndex !== -1) {
                    try {
                      const message = convertPayloadToMessage(payload.new, newWorkspace)
                      newWorkspace.channels[channelIndex].messages[messageIndex] = message
                    } catch (error) {
                      console.error('Error converting message payload:', error)
                    }
                  }
                }
              }
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const channelId = payload.old.channel_id
              if (channelId) {
                const channelIndex = newWorkspace.channels.findIndex(c => c.id === channelId)
                if (channelIndex !== -1) {
                  newWorkspace.channels[channelIndex].messages = newWorkspace.channels[channelIndex].messages.filter(m => m.id !== payload.old.id)
                }
              }
            }

            return newWorkspace
          })
        }
      )
      .subscribe()

    // Subscribe to DM messages
    const dmMessagesSubscription = supabase
      .channel('dm-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `dm_id=in.(${workspace.directMessages.map(dm => dm.id).join(',')})`
        },
        (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
          setWorkspace(prevWorkspace => {
            const newWorkspace = { ...prevWorkspace }

            if (payload.eventType === 'INSERT' && payload.new) {
              const dmId = payload.new.dm_id
              if (dmId) {
                const dmIndex = newWorkspace.directMessages.findIndex(dm => dm.id === dmId)
                if (dmIndex !== -1) {
                  try {
                    const message = convertPayloadToMessage(payload.new, newWorkspace)
                    newWorkspace.directMessages[dmIndex].messages.push(message)
                  } catch (error) {
                    console.error('Error converting message payload:', error)
                  }
                }
              }
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const dmId = payload.new.dm_id
              if (dmId) {
                const dmIndex = newWorkspace.directMessages.findIndex(dm => dm.id === dmId)
                if (dmIndex !== -1) {
                  const messageIndex = newWorkspace.directMessages[dmIndex].messages.findIndex(m => m.id === payload.new.id)
                  if (messageIndex !== -1) {
                    try {
                      const message = convertPayloadToMessage(payload.new, newWorkspace)
                      newWorkspace.directMessages[dmIndex].messages[messageIndex] = message
                    } catch (error) {
                      console.error('Error converting message payload:', error)
                    }
                  }
                }
              }
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const dmId = payload.old.dm_id
              if (dmId) {
                const dmIndex = newWorkspace.directMessages.findIndex(dm => dm.id === dmId)
                if (dmIndex !== -1) {
                  newWorkspace.directMessages[dmIndex].messages = newWorkspace.directMessages[dmIndex].messages.filter(m => m.id !== payload.old.id)
                }
              }
            }

            return newWorkspace
          })
        }
      )
      .subscribe()

    // Subscribe to user status changes
    const presenceSubscription = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceSubscription.presenceState() as PresenceState
        setWorkspace(prevWorkspace => {
          const newWorkspace = { ...prevWorkspace }
          newWorkspace.users = newWorkspace.users.map(user => {
            const userPresence = state[user.id]?.[0]
            return {
              ...user,
              status: userPresence?.status || 'offline'
            }
          })
          return newWorkspace
        })
      })
      .subscribe()

    // Track current user's presence
    const trackPresence = async () => {
      await presenceSubscription.track({
        user_id: currentUser.id,
        status: 'online'
      })
    }
    trackPresence()

    return () => {
      channelMessagesSubscription.unsubscribe()
      dmMessagesSubscription.unsubscribe()
      presenceSubscription.unsubscribe()
    }
  }, [workspace.id, currentUser.id])

  const addMessage = async (channelId: string | null, dmUserId: string | null, content: string) => {
    let dmId: string | null = null
    
    if (dmUserId) {
      // Find or create DM conversation
      const existingDm = workspace.directMessages.find(dm => 
        dm.participants.includes(currentUser.id) && dm.participants.includes(dmUserId)
      )
      
      if (existingDm) {
        dmId = existingDm.id
      } else {
        // Create new DM
        const { data: newDm, error: dmError } = await supabase
          .from('direct_messages')
          .insert({ workspace_id: workspace.id })
          .select()
          .single()
        
        if (dmError) throw dmError
        
        // Add participants
        await supabase.from('direct_message_participants').insert([
          { dm_id: newDm.id, user_id: currentUser.id },
          { dm_id: newDm.id, user_id: dmUserId }
        ])
        
        dmId = newDm.id
      }
    }

    // Insert message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: currentUser.id,
        channel_id: channelId,
        dm_id: dmId
      })

    if (messageError) throw messageError
  }

  const updateMessage = async (channelId: string | null, dmUserId: string | null, messageId: string, content: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)
      .eq('user_id', currentUser.id) // Ensure user owns the message

    if (error) throw error
  }

  const removeMessage = async (channelId: string | null, dmUserId: string | null, messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', currentUser.id) // Ensure user owns the message

    if (error) throw error
  }

  const updateUserStatus = async (status: 'online' | 'offline' | 'busy') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', currentUser.id)

    if (error) throw error

    // Update presence state
    const presenceChannel = supabase.channel('online-users')
    await presenceChannel.track({ user_id: currentUser.id, status })
  }

  useEffect(() => {
    setWorkspace(initialWorkspace)
  }, [initialWorkspace])

  return <ChatContext.Provider value={{ 
    workspace, 
    currentUser, 
    addMessage, 
    updateMessage, 
    removeMessage,
    updateUserStatus
  }}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}

