import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const WORKSPACES = [
  'General',
  'Marketing Team',
  'Engineering Team'
]

interface CreatedUser {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

async function seedData() {
  try {
    console.log('Starting seed...')

    // Create users
    const users: CreatedUser[] = []

    // Create admin user (Alice)
    const { data: alice, error: aliceError } = await supabase.auth.admin.createUser({
      email: 'alice@example.com',
      password: 'password123',
      email_confirm: true
    })
    if (aliceError) throw aliceError
    console.log('Created admin user:', alice.user.email)
    
    // Create profile for Alice
    const { error: aliceProfileError } = await supabase
      .from('profiles')
      .insert({
        id: alice.user.id,
        email: alice.user.email,
        status: 'online'
      })
    if (aliceProfileError) throw aliceProfileError
    console.log('Created profile for admin user')

    users.push({ id: alice.user.id, email: alice.user.email!, role: 'admin' })

    // Create regular users
    const regularUsers = [
      { email: 'bob@example.com' },
      { email: 'carol@example.com' },
      { email: 'dave@example.com' }
    ]

    for (const user of regularUsers) {
      const { data: createdUser, error: userError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'password123',
        email_confirm: true
      })
      if (userError) throw userError
      console.log('Created regular user:', createdUser.user.email)
      
      // Create profile for user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: createdUser.user.id,
          email: createdUser.user.email,
          status: 'online'
        })
      if (profileError) throw profileError
      console.log('Created profile for regular user')

      users.push({ id: createdUser.user.id, email: createdUser.user.email!, role: 'member' })
    }

    // Create workspaces
    const workspaceIds: Record<string, string> = {}

    for (const name of WORKSPACES) {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({ name })
        .select()
        .single()
      
      if (workspaceError) throw workspaceError
      console.log('Created workspace:', workspace.name)
      
      workspaceIds[name] = workspace.id

      // Add all users to General workspace
      // Add Alice to all workspaces as admin
      // Add other users based on workspace name
      for (const user of users) {
        if (
          name === 'General' || 
          user.role === 'admin' ||
          (name === 'Marketing Team' && ['bob@example.com', 'carol@example.com'].includes(user.email)) ||
          (name === 'Engineering Team' && ['dave@example.com'].includes(user.email))
        ) {
          const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
              workspace_id: workspace.id,
              user_id: user.id,
              role: user.role
            })
          
          if (memberError) throw memberError
          console.log(`Added ${user.email} to workspace: ${name}`)
        }
      }

      // Create default channels for each workspace
      const channels = name === 'General' 
        ? ['announcements', 'random', 'help']
        : name === 'Marketing Team'
        ? ['campaigns', 'social-media', 'content']
        : ['development', 'devops', 'bugs']

      for (const channelName of channels) {
        const { data: channel, error: channelError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            workspace_id: workspace.id
          })
          .select()
          .single()
        
        if (channelError) throw channelError
        console.log(`Created channel ${channelName} in workspace ${name}`)

        // Add some initial messages to channels
        const messages = [
          `Welcome to #${channelName}!`,
          `This is the ${channelName} channel in the ${name} workspace.`,
          `Feel free to start discussions here about ${channelName}.`
        ]

        for (const content of messages) {
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              content,
              channel_id: channel.id,
              user_id: alice.user.id // Posted by Alice
            })
          
          if (messageError) throw messageError
        }
        console.log(`Added initial messages to channel ${channelName}`)
      }
    }

    // Create DMs between users in each workspace
    for (const workspaceName in workspaceIds) {
      const workspaceId = workspaceIds[workspaceName]
      
      // Get members of this workspace
      const { data: members, error: membersError } = await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', workspaceId)
      
      if (membersError) throw membersError
      const memberIds = members.map(m => m.user_id)

      // Create DMs between all pairs of members
      for (let i = 0; i < memberIds.length; i++) {
        for (let j = i + 1; j < memberIds.length; j++) {
          const { data: dm, error: dmError } = await supabase
            .from('direct_messages')
            .insert({
              workspace_id: workspaceId
            })
            .select()
            .single()
          
          if (dmError) throw dmError

          // Add participants
          const participants = [
            { dm_id: dm.id, user_id: memberIds[i] },
            { dm_id: dm.id, user_id: memberIds[j] }
          ]

          for (const participant of participants) {
            const { error: participantError } = await supabase
              .from('dm_participants')
              .insert(participant)
            
            if (participantError) throw participantError
          }

          // Add initial message
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              content: 'Hey there! 👋',
              dm_id: dm.id,
              user_id: memberIds[i] // First user sends the message
            })
          
          if (messageError) throw messageError

          console.log(`Created DM between users ${memberIds[i]} and ${memberIds[j]} in workspace ${workspaceName}`)
        }
      }
    }

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
    throw error
  }
}

seedData() 