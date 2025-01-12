import { workspaces, users } from '../lib/data'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

// Map to store generated UUIDs for each entity
const userIds = new Map<string, string>()
const workspaceIds = new Map<string, string>()
const channelIds = new Map<string, string>()
const messageIds = new Map<string, string>()
const dmIds = new Map<string, string>()

// Generate SQL statements
const sqlStatements: string[] = []

// Helper to wrap strings for SQL
const q = (str: string) => `'${str.replace(/'/g, "''")}'`

// Generate UUIDs for all users and create auth.users entries
const authUsersSql = users.map(user => {
  const uuid = uuidv4()
  userIds.set(user.id, uuid)
  return `
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      '${uuid}',
      '${user.username}@example.com',
      jsonb_build_object('username', ${q(user.username)})
    );
  `
}).join('\n')

// Create profile entries
const profilesSql = users.map(user => {
  const uuid = userIds.get(user.id)!
  return `
    INSERT INTO public.profiles (id, username, avatar_url, status)
    VALUES (
      '${uuid}',
      ${q(user.username)},
      ${q(user.avatar)},
      ${q(user.status)}
    );
  `
}).join('\n')

// Create workspaces
const workspacesSql = workspaces.map(workspace => {
  const uuid = uuidv4()
  workspaceIds.set(workspace.id, uuid)
  return `
    INSERT INTO public.workspaces (id, name)
    VALUES ('${uuid}', ${q(workspace.name)});
  `
}).join('\n')

// Create workspace members
const workspaceMembersSql = workspaces.flatMap(workspace => {
  const workspaceUuid = workspaceIds.get(workspace.id)!
  return workspace.users.map(user => {
    const userUuid = userIds.get(user.id)!
    return `
      INSERT INTO public.workspace_members (workspace_id, user_id)
      VALUES ('${workspaceUuid}', '${userUuid}');
    `
  })
}).join('\n')

// Create channels
const channelsSql = workspaces.flatMap(workspace => {
  const workspaceUuid = workspaceIds.get(workspace.id)!
  return workspace.channels.map(channel => {
    const uuid = uuidv4()
    channelIds.set(channel.id, uuid)
    return `
      INSERT INTO public.channels (id, workspace_id, name)
      VALUES ('${uuid}', '${workspaceUuid}', ${q(channel.name)});
    `
  })
}).join('\n')

// Create channel messages
const channelMessagesSql = workspaces.flatMap(workspace =>
  workspace.channels.flatMap(channel => {
    const channelUuid = channelIds.get(channel.id)!
    return channel.messages.map(msg => {
      const uuid = uuidv4()
      messageIds.set(msg.id, uuid)
      const userUuid = userIds.get(msg.user.id)!
      return `
        INSERT INTO public.messages (id, content, user_id, channel_id, created_at)
        VALUES (
          '${uuid}',
          ${q(msg.content)},
          '${userUuid}',
          '${channelUuid}',
          '${msg.timestamp}'
        );
      `
    })
  })
).join('\n')

// Create DMs and their messages
const dmSql = workspaces.flatMap(workspace =>
  workspace.directMessages.flatMap(dm => {
    const dmUuid = uuidv4()
    dmIds.set(dm.id, dmUuid)
    const workspaceUuid = workspaceIds.get(workspace.id)!

    // Create DM conversation
    const createDm = `
      INSERT INTO public.direct_messages (id, workspace_id)
      VALUES ('${dmUuid}', '${workspaceUuid}');
    `

    // Add participants
    const addParticipants = dm.participants.map(user => {
      const userUuid = userIds.get(user.id)!
      return `
        INSERT INTO public.direct_message_participants (dm_id, user_id)
        VALUES ('${dmUuid}', '${userUuid}');
      `
    }).join('\n')

    // Add messages
    const addMessages = dm.messages.map(msg => {
      const uuid = uuidv4()
      messageIds.set(msg.id, uuid)
      const userUuid = userIds.get(msg.user.id)!
      return `
        INSERT INTO public.messages (id, content, user_id, dm_id, created_at)
        VALUES (
          '${uuid}',
          ${q(msg.content)},
          '${userUuid}',
          '${dmUuid}',
          '${msg.timestamp}'
        );
      `
    }).join('\n')

    return [createDm, addParticipants, addMessages].join('\n')
  })
).join('\n')

// Combine all SQL statements
const fullSql = `
-- Disable triggers temporarily for faster inserts
ALTER TABLE auth.users DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.workspaces DISABLE TRIGGER ALL;
ALTER TABLE public.workspace_members DISABLE TRIGGER ALL;
ALTER TABLE public.channels DISABLE TRIGGER ALL;
ALTER TABLE public.messages DISABLE TRIGGER ALL;
ALTER TABLE public.direct_messages DISABLE TRIGGER ALL;
ALTER TABLE public.direct_message_participants DISABLE TRIGGER ALL;
ALTER TABLE public.reactions DISABLE TRIGGER ALL;

-- Create users
${authUsersSql}

-- Create profiles
${profilesSql}

-- Create workspaces
${workspacesSql}

-- Create workspace members
${workspaceMembersSql}

-- Create channels
${channelsSql}

-- Create channel messages
${channelMessagesSql}

-- Create DMs and their messages
${dmSql}

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.workspaces ENABLE TRIGGER ALL;
ALTER TABLE public.workspace_members ENABLE TRIGGER ALL;
ALTER TABLE public.channels ENABLE TRIGGER ALL;
ALTER TABLE public.messages ENABLE TRIGGER ALL;
ALTER TABLE public.direct_messages ENABLE TRIGGER ALL;
ALTER TABLE public.direct_message_participants ENABLE TRIGGER ALL;
ALTER TABLE public.reactions ENABLE TRIGGER ALL;
`

// Write to seed file
fs.writeFileSync(
  path.join(process.cwd(), 'supabase', 'seed.sql'),
  fullSql
) 