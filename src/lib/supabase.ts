import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Channel types
export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Message types
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Reaction types
export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Status types
export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

export interface UserPresence {
  id: string;
  user_id: string;
  status: UserStatus;
  custom_status?: string;
  last_seen: string;
}

// Workspace API functions
export async function createWorkspace(name: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .rpc('create_workspace_with_member', {
      workspace_name: name,
      creator_id: user.data.user.id
    });

  if (error) throw error;
  return data;
}

export async function getWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateWorkspace(id: string, name: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteWorkspace(id: string) {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Channel API functions
export async function createChannel(workspaceId: string, name: string) {
  const { data, error } = await supabase
    .from('channels')
    .insert([{ workspace_id: workspaceId, name }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getChannels(workspaceId: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function updateChannel(id: string, name: string) {
  const { data, error } = await supabase
    .from('channels')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteChannel(id: string) {
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Message API functions
export async function createMessage(channelId: string, content: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      channel_id: channelId,
      user_id: user.data.user.id,
      content
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getMessages(channelId: string, limit = 50, before?: string) {
  let query = supabase
    .from('messages')
    .select(`
      *,
      user:users(id, email, display_name, avatar_url)
    `)
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function updateMessage(id: string, content: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', user.data.user.id) // Only allow updating own messages
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteMessage(id: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)
    .eq('user_id', user.data.user.id); // Only allow deleting own messages
  
  if (error) throw error;
}

// Reaction API functions
export async function addReaction(messageId: string, emoji: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reactions')
    .insert([{
      message_id: messageId,
      user_id: user.data.user.id,
      emoji
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeReaction(messageId: string, emoji: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', user.data.user.id)
    .eq('emoji', emoji);
  
  if (error) throw error;
}

export async function getReactions(messageId: string) {
  const { data, error } = await supabase
    .from('reactions')
    .select(`
      *,
      user:users(id, email, display_name, avatar_url)
    `)
    .eq('message_id', messageId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Status API functions
export async function updateStatus(status: UserStatus, customStatus?: string) {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: user.data.user.id,
      status,
      custom_status: customStatus,
      last_seen: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserStatus(userId: string) {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserStatuses(userIds: string[]) {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .in('user_id', userIds);
  
  if (error) throw error;
  return data;
}

// Real-time subscription functions
export type MessageSubscriptionCallback = (payload: {
  new: Message & { user: any };
  old: Message & { user: any } | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}) => void;

interface RealtimePostgresChangesPayload<T> {
  commit_timestamp: string;
  errors: null | any[];
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T | null;
  schema: string;
  table: string;
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
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          
          (payload.new as any).user = userData;
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.old.user_id)
            .single();
          
          (payload.old as any).user = userData;
        }

        callback({
          new: payload.new as Message & { user: any },
          old: payload.old as (Message & { user: any }) | null,
          eventType: payload.eventType
        });
      }
    )
    .subscribe();
}

export function unsubscribeFromChannelMessages(channelId: string) {
  return supabase.channel(`messages:${channelId}`).unsubscribe();
}

export type ReactionSubscriptionCallback = (payload: {
  new: Reaction & { user: any };
  old: Reaction & { user: any } | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}) => void;

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
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          
          (payload.new as any).user = userData;
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.old.user_id)
            .single();
          
          (payload.old as any).user = userData;
        }

        callback({
          new: payload.new as Reaction & { user: any },
          old: payload.old as (Reaction & { user: any }) | null,
          eventType: payload.eventType
        });
      }
    )
    .subscribe();
}

export function unsubscribeFromMessageReactions(messageId: string) {
  return supabase.channel(`reactions:${messageId}`).unsubscribe();
}

// You can also subscribe to reactions for multiple messages at once
export function subscribeToMessagesReactions(
  messageIds: string[],
  callback: ReactionSubscriptionCallback
) {
  return supabase
    .channel(`reactions:multiple`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `message_id=in.(${messageIds.join(',')})`
      },
      async (payload: RealtimePostgresChangesPayload<Reaction>) => {
        // Fetch user data for the reaction
        if (payload.new) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          
          (payload.new as any).user = userData;
        }
        
        if (payload.old) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, display_name, avatar_url')
            .eq('id', payload.old.user_id)
            .single();
          
          (payload.old as any).user = userData;
        }

        callback({
          new: payload.new as Reaction & { user: any },
          old: payload.old as (Reaction & { user: any }) | null,
          eventType: payload.eventType
        });
      }
    )
    .subscribe();
}

export type StatusSubscriptionCallback = (payload: {
  new: UserPresence;
  old: UserPresence | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}) => void;

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
        });
      }
    )
    .subscribe();
}

export function unsubscribeFromUserStatus(userId: string) {
  return supabase.channel(`presence:${userId}`).unsubscribe();
}

// Subscribe to multiple users' statuses at once
export function subscribeToUsersStatuses(
  userIds: string[],
  callback: StatusSubscriptionCallback
) {
  return supabase
    .channel(`presence:multiple`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=in.(${userIds.join(',')})`
      },
      (payload: RealtimePostgresChangesPayload<UserPresence>) => {
        callback({
          new: payload.new,
          old: payload.old,
          eventType: payload.eventType
        });
      }
    )
    .subscribe();
}

// Presence system for real-time online status
export function subscribeToPresence(channelId: string) {
  const channel = supabase.channel(`presence:${channelId}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence state:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Leave:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await channel.track({
            user_id: user.data.user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

  return channel;
} 