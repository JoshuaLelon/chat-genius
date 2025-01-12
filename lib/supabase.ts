import { createClient } from '@supabase/supabase-js'
import { Message, Reaction, UserPresence } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Message functions
export async function createMessage({ content, channel_id, dm_id, user_id }: {
  content: string
  channel_id?: string
  dm_id?: string
  user_id: string
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      channel_id,
      dm_id,
      user_id
    })
    .select('*, user:users(*)')
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

// Reaction functions
export async function addReaction(messageId: string, emoji: string) {
  const { data, error } = await supabase
    .from('reactions')
    .insert({
      message_id: messageId,
      emoji
    })
    .select('*, user:users(*)')
    .single()

  if (error) throw error
  return data
}

export async function removeReaction(messageId: string, emoji: string) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .match({
      message_id: messageId,
      emoji
    })

  if (error) throw error
}

// Real-time subscription functions
export type MessageSubscriptionCallback = (payload: {
  new: Message & { user: any }
  old: Message & { user: any } | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

interface RealtimePostgresChangesPayload<T> {
  commit_timestamp: string
  errors: null | any[]
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T | null
  schema: string
  table: string
}

export function subscribeToChannelMessages(
  channelId: string,
  callback: MessageSubscriptionCallback
) {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      },
      async (payload: RealtimePostgresChangesPayload<Message>) => {
        // Fetch user data for the message
        if (payload.new) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, username, avatar')
            .eq('id', payload.new.user_id)
            .single()
          
          ;(payload.new as any).user = userData
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, username, avatar')
            .eq('id', payload.old.user_id)
            .single()
          
          ;(payload.old as any).user = userData
        }

        callback({
          new: payload.new as Message & { user: any },
          old: payload.old as (Message & { user: any }) | null,
          eventType: payload.eventType
        })
      }
    )
    .subscribe()
}

export function unsubscribeFromChannelMessages(channelId: string) {
  return supabase.channel(`messages:${channelId}`).unsubscribe()
}

export type ReactionSubscriptionCallback = (payload: {
  new: Reaction & { user: any }
  old: Reaction & { user: any } | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

export function subscribeToMessageReactions(
  messageId: string,
  callback: ReactionSubscriptionCallback
) {
  return supabase
    .channel(`reactions:${messageId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `message_id=eq.${messageId}`
      },
      async (payload: RealtimePostgresChangesPayload<Reaction>) => {
        // Fetch user data for the reaction
        if (payload.new) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, username, avatar')
            .eq('id', payload.new.user_id)
            .single()
          
          ;(payload.new as any).user = userData
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, username, avatar')
            .eq('id', payload.old.user_id)
            .single()
          
          ;(payload.old as any).user = userData
        }

        callback({
          new: payload.new as Reaction & { user: any },
          old: payload.old as (Reaction & { user: any }) | null,
          eventType: payload.eventType
        })
      }
    )
    .subscribe()
}

export function unsubscribeFromMessageReactions(messageId: string) {
  return supabase.channel(`reactions:${messageId}`).unsubscribe()
}

// User presence functions
export async function updateUserStatus(userId: string, status: 'online' | 'offline' | 'busy') {
  const { error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: userId,
      status,
      last_seen: new Date().toISOString()
    })

  if (error) throw error
}

export type StatusSubscriptionCallback = (payload: {
  new: UserPresence
  old: UserPresence | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

export function subscribeToUserStatus(
  userId: string,
  callback: StatusSubscriptionCallback
) {
  return supabase
    .channel(`presence:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${userId}`
      },
      (payload: RealtimePostgresChangesPayload<UserPresence>) => {
        callback({
          new: payload.new,
          old: payload.old,
          eventType: payload.eventType
        })
      }
    )
    .subscribe()
}

export function unsubscribeFromUserStatus(userId: string) {
  return supabase.channel(`presence:${userId}`).unsubscribe()
} 