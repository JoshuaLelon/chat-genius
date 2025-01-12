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