import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAPI() {
  try {
    console.log('Starting API tests...\n');

    // Create test auth user
    console.log('Creating test auth user:');
    const timestamp = new Date().getTime();
    const email = `test-${timestamp}@chat-genius.local`;
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'test-password-123',
      email_confirm: true
    });

    if (authError) throw authError;
    if (!user) throw new Error('Failed to create auth user');
    console.log('  ✓ Auth user created:', user.id);

    // Create test user profile
    console.log('\nCreating test profile:');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        username: `test-user-${timestamp}`,
        status: 'online'
      }]);

    if (profileError) throw profileError;
    console.log('  ✓ Profile created:', user.id);

    // Test workspace operations
    console.log('\nTesting workspace operations:');
    
    // Create workspace
    console.log('- Creating workspace...');
    const { data: workspace, error: createError } = await supabase
      .from('workspaces')
      .insert([{ name: 'Test Workspace' }])
      .select()
      .single();
    
    if (createError) throw createError;
    console.log('  ✓ Workspace created:', workspace.id);

    // Create workspace member
    console.log('- Adding workspace member...');
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert([{ 
        workspace_id: workspace.id,
        user_id: user.id
      }]);
    
    if (memberError) throw memberError;
    console.log('  ✓ Member added');

    // List workspaces
    console.log('- Listing workspaces...');
    const { data: workspaces, error: listError } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (listError) throw listError;
    console.log('  ✓ Workspaces listed:', workspaces.length, 'found');

    // Update workspace
    console.log('- Updating workspace...');
    const { data: updatedWorkspace, error: updateError } = await supabase
      .from('workspaces')
      .update({ name: 'Updated Test Workspace' })
      .eq('id', workspace.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    console.log('  ✓ Workspace updated');

    // Test channel operations
    console.log('\nTesting channel operations:');

    // Create channel
    console.log('- Creating channel...');
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .insert([{ 
        workspace_id: workspace.id,
        name: 'Test Channel'
      }])
      .select()
      .single();
    
    if (channelError) throw channelError;
    console.log('  ✓ Channel created:', channel.id);

    // List channels
    console.log('- Listing channels...');
    const { data: channels, error: listChannelsError } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });
    
    if (listChannelsError) throw listChannelsError;
    console.log('  ✓ Channels listed:', channels.length, 'found');

    // Update channel
    console.log('- Updating channel...');
    const { data: updatedChannel, error: updateChannelError } = await supabase
      .from('channels')
      .update({ name: 'Updated Test Channel' })
      .eq('id', channel.id)
      .select()
      .single();
    
    if (updateChannelError) throw updateChannelError;
    console.log('  ✓ Channel updated');

    // Test message operations
    console.log('\nTesting message operations:');

    // Create message
    console.log('- Creating message...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        content: 'Test Message',
        user_id: user.id,
        channel_id: channel.id
      }])
      .select()
      .single();
    
    if (messageError) throw messageError;
    console.log('  ✓ Message created:', message.id);

    // Cleanup
    console.log('\nCleaning up test data:');

    // Delete message
    console.log('- Deleting message...');
    const { error: deleteMessageError } = await supabase
      .from('messages')
      .delete()
      .eq('id', message.id);
    
    if (deleteMessageError) throw deleteMessageError;
    console.log('  ✓ Message deleted');

    // Delete channel
    console.log('- Deleting channel...');
    const { error: deleteChannelError } = await supabase
      .from('channels')
      .delete()
      .eq('id', channel.id);
    
    if (deleteChannelError) throw deleteChannelError;
    console.log('  ✓ Channel deleted');

    // Delete workspace member
    console.log('- Deleting workspace member...');
    const { error: deleteMemberError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace.id)
      .eq('user_id', user.id);
    
    if (deleteMemberError) throw deleteMemberError;
    console.log('  ✓ Member deleted');

    // Delete workspace
    console.log('- Deleting workspace...');
    const { error: deleteWorkspaceError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);
    
    if (deleteWorkspaceError) throw deleteWorkspaceError;
    console.log('  ✓ Workspace deleted');

    // Delete profile
    console.log('- Deleting profile...');
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    
    if (deleteProfileError) throw deleteProfileError;
    console.log('  ✓ Profile deleted');

    // Delete auth user
    console.log('- Deleting auth user...');
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteAuthError) throw deleteAuthError;
    console.log('  ✓ Auth user deleted');

    console.log('\nAll tests completed successfully! ✨');
  } catch (error) {
    console.error('\nError during tests:', error);
  }
}

testAPI(); 