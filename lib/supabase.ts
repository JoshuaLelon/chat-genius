import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Message, Reaction, User, Channel, DirectMessage, Workspace } from '@/types'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

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
    .select('user_id, role')
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
        ),
        reactions(
          message_id,
          user_id,
          emoji,
          created_at,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        )
      `)
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for channel:", channel.id, messagesError);
      throw messagesError;
    }

    return {
      ...channel,
      messages: messages || []
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
        ),
        reactions(
          message_id,
          user_id,
          emoji,
          created_at,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        )
      `)
      .eq('dm_id', dm.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for DM:", dm.id, messagesError);
      throw messagesError;
    }

    return {
      ...dm,
      participants: participants.map(p => p.participant),
      messages: messages || []
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
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        channel_id,
        dm_id,
        user_id
      })
      .select(`
        *,
        sender:profiles!messages_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        ),
        reactions(
          message_id,
          user_id,
          emoji,
          created_at,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        )
      `)
      .single()
  
    console.log("[Supabase] Create message result:", { data, error });
    if (error) {
      console.error("[Supabase] Error creating message:", error);
      throw error;
    }
    console.log("[Supabase] Successfully created message:", data);
    return data;
  } catch (error) {
    console.error("[Supabase] Error in createMessage:", error);
    throw error;
  }
}

// User functions
export async function updateUserStatus(userId: string, status: 'online' | 'offline' | 'busy') {
  console.log("[Supabase] Updating user status:", { userId, status });
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating user status:", error);
    throw error;
  }

  console.log("[Supabase] Successfully updated user status:", data);
  return data;
}

// Real-time subscriptions
export type MessageSubscriptionCallback = (payload: {
  new: Message & { sender: User }
  old: Message & { sender: User } | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

export function subscribeToChannelMessages(
  channelId: string,
  callback: MessageSubscriptionCallback
) {
  console.log("[Supabase] Subscribing to channel messages:", channelId);
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
        console.log("[Supabase] Received message change:", payload);
        // Fetch user data for the message
        if (payload.new) {
          console.log("[Supabase] Fetching sender data for new message");
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()
          
          payload.new.sender = userData
        }
        
        if (payload.old) {
          console.log("[Supabase] Fetching sender data for old message");
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.old.user_id)
            .single()
          
          payload.old.sender = userData
        }

        console.log("[Supabase] Invoking message subscription callback");
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
  console.log("[Supabase] Unsubscribing from channel messages:", channelId);
  return supabase.channel(`messages:${channelId}`).unsubscribe()
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
  console.log("[Supabase] Subscribing to user status:", userId);
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
        console.log("[Supabase] Received status change:", payload);
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
  console.log("[Supabase] Unsubscribing from user status:", userId);
  return supabase.channel(`presence:${userId}`).unsubscribe()
}

// Reaction functions
export async function addReaction(messageId: string, emoji: string, userId: string) {
  console.log("[Supabase] Adding reaction:", { messageId, emoji, userId });
  
  try {
    // First check if reaction already exists
    const { data: existingReaction } = await supabase
      .from('reactions')
      .select('*')
      .match({
        message_id: messageId,
        emoji,
        user_id: userId
      })
      .single();

    if (existingReaction) {
      console.log("[Supabase] Reaction already exists:", existingReaction);
      return existingReaction;
    }

    const { data, error } = await supabase
      .from('reactions')
      .insert({
        message_id: messageId,
        emoji,
        user_id: userId
      })
      .select(`
        *,
        reactor:profiles!reactions_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        )
      `)
      .single()

    if (error) {
      console.error("[Supabase] Error adding reaction:", error);
      throw error;
    }
    console.log("[Supabase] Successfully added reaction:", data);
    return data;
  } catch (error) {
    console.error("[Supabase] Error in addReaction:", error);
    throw error;
  }
}

export function removeReaction(messageId: string, emoji: string, userId: string) {
  console.log("[Supabase] Removing reaction:", { messageId, emoji, userId });
  return supabase
    .from('reactions')
    .delete()
    .match({
      message_id: messageId,
      emoji: emoji,
      user_id: userId
    })
    .then(result => {
      console.log("[Supabase] Remove reaction result:", result);
      return result;
    });
}

export type ReactionSubscriptionCallback = (payload: {
  new: Reaction & { reactor: User }
  old: Reaction & { reactor: User } | null
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}) => void

export function subscribeToMessageReactions(
  messageId: string,
  callback: ReactionSubscriptionCallback
) {
  console.log("[Supabase] Subscribing to message reactions:", messageId);
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
        console.log("[Supabase] Received reaction change:", payload);
        try {
          // Fetch user data for the reaction
          if (payload.new) {
            console.log("[Supabase] Fetching reactor data for new reaction");
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.user_id)
              .single()
            
            if (userError) {
              console.error("[Supabase] Error fetching reactor data for new reaction:", userError);
              return;
            }
            
            payload.new.reactor = userData
            console.log("[Supabase] Added reactor data to new reaction:", payload.new);
          }
          
          if (payload.old) {
            console.log("[Supabase] Fetching reactor data for old reaction");
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.old.user_id)
              .single()
            
            if (userError) {
              console.error("[Supabase] Error fetching reactor data for old reaction:", userError);
              return;
            }
            
            payload.old.reactor = userData
            console.log("[Supabase] Added reactor data to old reaction:", payload.old);
          }

          console.log("[Supabase] Invoking reaction subscription callback with payload:", {
            new: payload.new,
            old: payload.old,
            eventType: payload.eventType
          });
          callback({
            new: payload.new,
            old: payload.old,
            eventType: payload.eventType
          })
        } catch (error) {
          console.error("[Supabase] Error in reaction subscription handler:", error);
        }
      }
    )
    .subscribe()
}

export function unsubscribeFromMessageReactions(messageId: string) {
  console.log("[Supabase] Unsubscribing from message reactions:", messageId);
  return supabase.channel(`reactions:${messageId}`).unsubscribe()
}

export async function getChannel(channelId: string) {
  try {
    console.log("[Supabase] Getting channel:", channelId);
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError) {
      console.error("[Supabase] Error fetching channel:", channelId, channelError);
      throw channelError;
    }

    // Get messages
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
        ),
        reactions(
          message_id,
          user_id,
          emoji,
          created_at,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        )
      `)
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for channel:", channel.id, messagesError);
      throw messagesError;
    }

    return {
      ...channel,
      messages: messages || []
    };
  } catch (error) {
    console.error("[Supabase] Error in getChannel:", error);
    throw error;
  }
}

export async function getChannelMessages(channelId: string) {
  try {
    console.log("[Supabase] Fetching messages for channel:", channelId);
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_user_id_fkey(
          id,
          email,
          avatar_url,
          status
        ),
        reactions(
          message_id,
          user_id,
          emoji,
          created_at,
          reactor:profiles!reactions_user_id_fkey(
            id,
            email,
            avatar_url,
            status
          )
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("[Supabase] Error fetching messages for channel:", channelId, messagesError);
      throw messagesError;
    }

    return messages || [];
  } catch (error) {
    console.error("[Supabase] Error in getChannelMessages:", error);
    throw error;
  }
}

export async function getUser(userId: string) {
  console.log("[Supabase] Getting user:", userId);
  
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error("[Supabase] Error getting user:", error);
    throw error;
  }
  
  console.log("[Supabase] Successfully got user:", user);
  return user;
}

export function subscribeToWorkspace(
  workspaceId: string,
  onUpdate: (type: 'messages' | 'reactions' | 'status', data: any) => void
) {
  console.log("[Supabase] Setting up workspace subscription for:", workspaceId);
  return supabase
    .channel(`workspace:${workspaceId}`)
    .on(
      'postgres_changes',
      { 
        event: 'DELETE',
        schema: 'public',
        table: 'reactions'
      },
      async (payload: RealtimePostgresChangesPayload<Reaction>) => {
        console.log("[Supabase] Reaction DELETE received:", payload);
        onUpdate('reactions', payload);
      }
    )
    .on(
      'postgres_changes',
      { 
        event: 'INSERT',
        schema: 'public',
        table: 'reactions'
      },
      async (payload: RealtimePostgresChangesPayload<Reaction>) => {
        console.log("[Supabase] Reaction INSERT received:", payload);
        const reaction = payload.new as Reaction;
        if (reaction) {
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', reaction.user_id)
            .single();
            
          if (error) {
            console.error("[Supabase] Error fetching reactor data:", error);
          } else {
            (reaction as any).reactor = userData;
          }
        }
        onUpdate('reactions', payload);
      }
    )
    .subscribe();
} 