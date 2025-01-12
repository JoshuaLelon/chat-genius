import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLS() {
  try {
    const sql = `
      alter table public.profiles disable row level security;
      alter table public.workspaces disable row level security;
      alter table public.workspace_members disable row level security;
      alter table public.channels disable row level security;
      alter table public.messages disable row level security;
      alter table public.direct_messages disable row level security;
      alter table public.direct_message_participants disable row level security;
      alter table public.reactions disable row level security;

      -- Drop all existing policies
      drop policy if exists "Profiles are viewable by workspace members" on public.profiles;
      drop policy if exists "Users can update own profile" on public.profiles;
      drop policy if exists "Anyone can create workspaces" on public.workspaces;
      drop policy if exists "Workspaces are viewable by members" on public.workspaces;
      drop policy if exists "Members can update workspaces" on public.workspaces;
      drop policy if exists "Members can delete workspaces" on public.workspaces;
      drop policy if exists "Creator can view their workspaces" on public.workspaces;
      drop policy if exists "Creator can update their workspaces" on public.workspaces;
      drop policy if exists "Creator can delete their workspaces" on public.workspaces;
      drop policy if exists "Anyone can add workspace members" on public.workspace_members;
      drop policy if exists "Members can view other workspace members" on public.workspace_members;
      drop policy if exists "Members can remove workspace members" on public.workspace_members;
      drop policy if exists "Workspace members are viewable by workspace members" on public.workspace_members;
      drop policy if exists "Creator can add members" on public.workspace_members;
      drop policy if exists "Members can view workspace members" on public.workspace_members;
      drop policy if exists "Channels are viewable by workspace members" on public.channels;
      drop policy if exists "Members can create channels" on public.channels;
      drop policy if exists "Members can view channels" on public.channels;
      drop policy if exists "Members can update channels" on public.channels;
      drop policy if exists "Members can delete channels" on public.channels;
      drop policy if exists "Channel messages are viewable by workspace members" on public.messages;
      drop policy if exists "Users can create messages" on public.messages;
      drop policy if exists "Users can update own messages" on public.messages;
      drop policy if exists "Members can view messages" on public.messages;
      drop policy if exists "Members can create messages" on public.messages;
      drop policy if exists "Direct messages are viewable by participants" on public.direct_messages;
      drop policy if exists "DM participants are viewable by participants" on public.direct_message_participants;
      drop policy if exists "Reactions are viewable by conversation participants" on public.reactions;
      drop policy if exists "Users can create reactions" on public.reactions;
      drop policy if exists "Users can delete own reactions" on public.reactions;
    `;

    await supabase.rpc('run_sql', { sql });
    console.log('RLS disabled successfully');
  } catch (error) {
    console.error('Error disabling RLS:', error);
  }
}

disableRLS(); 