import { beforeAll, afterAll } from 'vitest';
import { supabase } from '@/lib/supabase';

beforeAll(async () => {
  // Sign in with development user credentials
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: process.env.NEXT_PUBLIC_TEST_USER_EMAIL!,
    password: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD!,
  });

  if (signInError) {
    console.error('Error signing in:', signInError);
    throw signInError;
  }

  // Clean up any existing test data
  // First, find all test workspaces
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .like('name', 'Test%');

  if (workspaces?.length) {
    // Delete workspace members first
    const { error: membersError } = await supabase
      .from('workspace_members')
      .delete()
      .in('workspace_id', workspaces.map(w => w.id));

    if (membersError) {
      console.error('Error cleaning up workspace members:', membersError);
    }

    // Then delete workspaces
    const { error: workspaceError } = await supabase
      .from('workspaces')
      .delete()
      .in('id', workspaces.map(w => w.id));

    if (workspaceError) {
      console.error('Error cleaning up workspaces:', workspaceError);
    }
  }
});

afterAll(async () => {
  // Sign out after tests
  await supabase.auth.signOut();
}); 