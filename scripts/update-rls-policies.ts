import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRLSPolicies() {
  try {
    // Drop existing policies
    const tablesToUpdate = ['workspaces', 'workspace_members', 'channels', 'messages'];
    const policyNames = [
      'Anyone can create workspaces',
      'Workspaces are viewable by members',
      'Members can update workspaces',
      'Members can delete workspaces',
      'Anyone can add workspace members',
      'Members can view other workspace members',
      'Members can remove workspace members',
      'Workspace members are viewable by workspace members',
      'Channels are viewable by workspace members',
      'Channel messages are viewable by workspace members'
    ];

    // Drop all existing policies
    for (const table of tablesToUpdate) {
      for (const policy of policyNames) {
        await supabase.rpc('drop_policy', {
          table_name: table,
          policy_name: policy
        });
      }
    }

    // Create new policies
    const policies = [
      // Workspace policies
      {
        name: 'Anyone can create workspaces',
        table: 'workspaces',
        operation: 'INSERT',
        check: 'true'
      },
      {
        name: 'Creator can view their workspaces',
        table: 'workspaces',
        operation: 'SELECT',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Creator can update their workspaces',
        table: 'workspaces',
        operation: 'UPDATE',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Creator can delete their workspaces',
        table: 'workspaces',
        operation: 'DELETE',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = id
          and workspace_members.user_id = auth.uid()
        )`
      },
      // Workspace members policies
      {
        name: 'Creator can add members',
        table: 'workspace_members',
        operation: 'INSERT',
        check: `auth.uid() = user_id or exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Members can view workspace members',
        table: 'workspace_members',
        operation: 'SELECT',
        using: `user_id = auth.uid() or exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Members can remove workspace members',
        table: 'workspace_members',
        operation: 'DELETE',
        using: `user_id = auth.uid() or exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      // Channel policies
      {
        name: 'Members can create channels',
        table: 'channels',
        operation: 'INSERT',
        check: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Members can view channels',
        table: 'channels',
        operation: 'SELECT',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Members can update channels',
        table: 'channels',
        operation: 'UPDATE',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      {
        name: 'Members can delete channels',
        table: 'channels',
        operation: 'DELETE',
        using: `exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = workspace_id
          and workspace_members.user_id = auth.uid()
        )`
      },
      // Message policies
      {
        name: 'Members can view messages',
        table: 'messages',
        operation: 'SELECT',
        using: `(
          channel_id is not null and exists (
            select 1 from public.channels
            join public.workspace_members on workspace_members.workspace_id = channels.workspace_id
            where channels.id = channel_id
            and workspace_members.user_id = auth.uid()
          )
        ) or (
          dm_id is not null and exists (
            select 1 from public.direct_message_participants
            where direct_message_participants.dm_id = dm_id
            and direct_message_participants.user_id = auth.uid()
          )
        )`
      },
      {
        name: 'Members can create messages',
        table: 'messages',
        operation: 'INSERT',
        check: `auth.uid() = user_id and (
          (
            channel_id is not null and exists (
              select 1 from public.channels
              join public.workspace_members on workspace_members.workspace_id = channels.workspace_id
              where channels.id = channel_id
              and workspace_members.user_id = auth.uid()
            )
          ) or (
            dm_id is not null and exists (
              select 1 from public.direct_message_participants
              where direct_message_participants.dm_id = dm_id
              and direct_message_participants.user_id = auth.uid()
            )
          )
        )`
      }
    ];

    for (const policy of policies) {
      await supabase.rpc('create_policy', {
        policy_name: policy.name,
        table_name: policy.table,
        operation: policy.operation,
        using_expression: policy.using || null,
        check_expression: policy.check || null
      });
    }

    console.log('RLS policies updated successfully');
  } catch (error) {
    console.error('Error updating RLS policies:', error);
  }
}

updateRLSPolicies(); 