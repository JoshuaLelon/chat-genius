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
  console.log("[Supabase] Fetching workspace details...");
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()
  
  console.log("[Supabase] Workspace query result:", { workspace, workspaceError });
  if (workspaceError) {
    console.error("[Supabase] Error fetching workspace:", workspaceError);
    throw workspaceError;
  }
  console.log("[Supabase] Successfully fetched workspace");

  // Get workspace members (users)
  console.log("[Supabase] Getting workspace members...");
  console.log("[Supabase] First fetching member IDs...");
  const membersQuery = await supabase
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId);
  
  console.log("[Supabase] Member IDs query result:", membersQuery);
  const memberIds = membersQuery.data?.map(m => m.user_id) || [];
  console.log("[Supabase] Member IDs:", memberIds);

  console.log("[Supabase] Fetching member profiles...");
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', memberIds);
  
  console.log("[Supabase] Workspace members result:", { users, usersError });
  if (usersError) {
    console.error("[Supabase] Error fetching workspace members:", usersError);
    throw usersError;
  }
  console.log("[Supabase] Successfully fetched workspace members");

  // Get channels
  console.log("[Supabase] Getting channels...");
  console.log("[Supabase] Building channels query...");
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId)
  
  console.log("[Supabase] Channels query result:", { channels, channelsError });
  if (channelsError) {
    console.error("[Supabase] Error fetching channels:", channelsError);
    throw channelsError;
  }
  console.log("[Supabase] Successfully fetched channels");

  // Get messages for channels
  console.log("[Supabase] Getting messages for channels...");
  const messagesPromises = channels.map(async channel => {
    console.log("[Supabase] Fetching messages for channel:", channel.id);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        )
      `)
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for channel:", channel.id, messagesError);
      throw messagesError;
    }

    // Get reactions for messages
    console.log("[Supabase] Getting reactions for messages in channel:", channel.id);
    const messagesWithReactions = await Promise.all(messages.map(async message => {
      const { data: reactions, error: reactionsError } = await supabase
        .from('reactions')
        .select(`
          *,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        `)
        .eq('message_id', message.id);

      if (reactionsError) {
        console.error("[Supabase] Error fetching reactions for message:", message.id, reactionsError);
        throw reactionsError;
      }

      return {
        ...message,
        reactions: reactions || []
      };
    }));

    return {
      ...channel,
      messages: messagesWithReactions || []
    };
  });

  const channelsWithMessages = await Promise.all(messagesPromises);
  console.log("[Supabase] Successfully fetched all channel messages and reactions");

  // Get direct messages
  console.log("[Supabase] Getting direct messages...");
  console.log("[Supabase] Building DMs query...");
  const { data: directMessages, error: dmsError } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('workspace_id', workspaceId)
  
  console.log("[Supabase] Direct messages query result:", { directMessages, dmsError });
  if (dmsError) {
    console.error("[Supabase] Error fetching direct messages:", dmsError);
    throw dmsError;
  }
  console.log("[Supabase] Successfully fetched direct messages");

  // Get participants and messages for DMs
  console.log("[Supabase] Getting participants and messages for DMs...");
  const dmsPromises = directMessages.map(async dm => {
    // Get participants
    console.log("[Supabase] Fetching participants for DM:", dm.id);
    const { data: participants, error: participantsError } = await supabase
      .from('dm_participants')
      .select(`
        participant:profiles!dm_participants_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        )
      `)
      .eq('dm_id', dm.id);

    if (participantsError) {
      console.error("[Supabase] Error fetching participants for DM:", dm.id, participantsError);
      throw participantsError;
    }

    // Get messages
    console.log("[Supabase] Fetching messages for DM:", dm.id);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        )
      `)
      .eq('dm_id', dm.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for DM:", dm.id, messagesError);
      throw messagesError;
    }

    // Get reactions for messages
    console.log("[Supabase] Getting reactions for messages in DM:", dm.id);
    const messagesWithReactions = await Promise.all(messages.map(async message => {
      const { data: reactions, error: reactionsError } = await supabase
        .from('reactions')
        .select(`
          *,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        `)
        .eq('message_id', message.id);

      if (reactionsError) {
        console.error("[Supabase] Error fetching reactions for message:", message.id, reactionsError);
        throw reactionsError;
      }

      return {
        ...message,
        reactions: reactions || []
      };
    }));

    return {
      ...dm,
      participants: participants?.map(p => p.participant) || [],
      messages: messagesWithReactions || []
    };
  });

  const dmsWithParticipantsAndMessages = await Promise.all(dmsPromises);
  console.log("[Supabase] Successfully fetched all DM participants, messages and reactions");

  console.log("[Supabase] Building final workspace result...");
  const result = {
    ...workspace,
    users,
    channels: channelsWithMessages,
    directMessages: dmsWithParticipantsAndMessages
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