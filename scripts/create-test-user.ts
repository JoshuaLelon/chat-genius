import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: process.env.NEXT_PUBLIC_TEST_USER_EMAIL!,
      password: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD!,
      email_confirm: true // Auto-confirm email
    });

    if (authError) throw authError;
    if (!authUser.user) throw new Error('Failed to create auth user');

    console.log('Created auth user:', authUser.user.id);

    // Create profile in public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        username: 'testuser',
        status: 'offline'
      });

    if (profileError) throw profileError;

    console.log('Created user profile');

    // Create a default workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'Test Workspace'
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    console.log('Created workspace:', workspace.id);

    // Add user to workspace
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: authUser.user.id
      });

    if (memberError) throw memberError;

    console.log('Added user to workspace');

    // Create a default channel
    const { error: channelError } = await supabase
      .from('channels')
      .insert({
        workspace_id: workspace.id,
        name: 'general'
      });

    if (channelError) throw channelError;

    console.log('Created default channel');

    console.log('Test user setup complete!');
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser(); 