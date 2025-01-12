import { supabase } from '@/lib/supabase'

async function fetchAllData() {
  console.log('Fetching data from all tables...\n')

  // Fetch profiles (users)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
  console.log('Profiles:', profiles || profilesError)

  // Fetch workspaces
  const { data: workspaces, error: workspacesError } = await supabase
    .from('workspaces')
    .select('*')
  console.log('\nWorkspaces:', workspaces || workspacesError)

  // Fetch workspace members
  const { data: workspaceMembers, error: workspaceMembersError } = await supabase
    .from('workspace_members')
    .select('*')
  console.log('\nWorkspace Members:', workspaceMembers || workspaceMembersError)

  // Fetch channels
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('*')
  console.log('\nChannels:', channels || channelsError)

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*, user:profiles(*)')
  console.log('\nMessages:', messages || messagesError)

  // Fetch direct messages
  const { data: directMessages, error: directMessagesError } = await supabase
    .from('direct_messages')
    .select('*')
  console.log('\nDirect Messages:', directMessages || directMessagesError)

  // Fetch direct message participants
  const { data: dmParticipants, error: dmParticipantsError } = await supabase
    .from('direct_message_participants')
    .select('*')
  console.log('\nDM Participants:', dmParticipants || dmParticipantsError)

  // Fetch reactions
  const { data: reactions, error: reactionsError } = await supabase
    .from('reactions')
    .select('*, user:profiles(*)')
  console.log('\nReactions:', reactions || reactionsError)
}

fetchAllData().catch(console.error) 