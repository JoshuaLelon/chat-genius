import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Message, Reaction, User, Channel, DirectMessage, Workspace } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("[Supabase] Creating client with URL:", supabaseUrl);

// Create authenticated Supabase client
export const supabase = createClientComponentClient()

// Workspace functions
export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  console.log("[Supabase] Getting workspace:", workspaceId);
  
  // Get workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()
  
  console.log("[Supabase] Workspace query result:", { workspace, workspaceError });
  if (workspaceError) throw workspaceError

  // Get workspace members (users)
  console.log("[Supabase] Getting workspace members...");
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', (
      await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', workspaceId)
    ).data?.map(m => m.user_id) || [])
  
  console.log("[Supabase] Workspace members result:", { users, usersError });
  if (usersError) throw usersError

  // Get channels
  console.log("[Supabase] Getting channels...");
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select(`
      *,
      messages:messages(
        *,
        user:profiles(*),
        reactions:reactions(
          *,
          user:profiles(*)
        )
      )
    `)
    .eq('workspace_id', workspaceId)
  
  console.log("[Supabase] Channels result:", { channels, channelsError });
  if (channelsError) throw channelsError

  // Get direct messages
  console.log("[Supabase] Getting direct messages...");
  const { data: directMessages, error: dmsError } = await supabase
    .from('direct_messages')
    .select(`
      *,
      participants:dm_participants(
        user:profiles(*)
      ),
      messages:messages(
        *,
        user:profiles(*),
        reactions:reactions(
          *,
          user:profiles(*)
        )
      )
    `)
    .eq('workspace_id', workspaceId)
  
  console.log("[Supabase] Direct messages result:", { directMessages, dmsError });
  if (dmsError) throw dmsError

  const result = {
    ...workspace,
    users,
    channels: channels.map(channel => ({
      ...channel,
      messages: channel.messages || []
    })),
    directMessages: directMessages.map(dm => ({
      ...dm,
      participants: dm.participants?.map(p => p.user) || [],
      messages: dm.messages || []
    }))
  };

  console.log("[Supabase] Final workspace result:", result);
  return result;
}

// Message functions
export async function createMessage({ content, channel_id, dm_id, user_id }: {
  content: string
  channel_id?: string
  dm_id?: string
  user_id: string
}) {
  console.log("[Supabase] Creating message:", { content, channel_id, dm_id, user_id });
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      channel_id,
      dm_id,
      user_id
    })
    .select('*, user:profiles(*)')
  
  console.log("[Supabase] Create message result:", { data, error });
  return { data, error };
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

// Reaction functions
export async function addReaction(messageId: string, emoji: string, userId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .insert({
      message_id: messageId,
      emoji,
      user_id: userId
    })
    .select('*, user:profiles(*)')
    .single()

  if (error) throw error
  return data
}

export async function removeReaction(messageId: string, emoji: string, userId: string) {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .match({
      message_id: messageId,
      emoji,
      user_id: userId
    })

  if (error) throw error
}

// User functions
export async function updateUserStatus(userId: string, status: 'online' | 'offline' | 'busy') {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) throw error
}

// Real-time subscriptions
export type MessageSubscriptionCallback = (payload: {
  new: Message & { user: User }
  old: Message & { user: User } | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

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
      async (payload: any) => {
        // Fetch user data for the message
        if (payload.new) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()
          
          payload.new.user = userData
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.old.user_id)
            .single()
          
          payload.old.user = userData
        }

        callback({
          new: payload.new,
          old: payload.old,
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
  new: Reaction & { user: User }
  old: Reaction & { user: User } | null
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
      async (payload: any) => {
        // Fetch user data for the reaction
        if (payload.new) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()
          
          payload.new.user = userData
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.old.user_id)
            .single()
          
          payload.old.user = userData
        }

        callback({
          new: payload.new,
          old: payload.old,
          eventType: payload.eventType
        })
      }
    )
    .subscribe()
}

export function unsubscribeFromMessageReactions(messageId: string) {
  return supabase.channel(`reactions:${messageId}`).unsubscribe()
}

export type StatusSubscriptionCallback = (payload: {
  new: User
  old: User | null
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
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload: any) => {
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