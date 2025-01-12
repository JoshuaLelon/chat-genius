import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client for all operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USERS = [
  { email: 'alice@chat-genius.local', password: 'test-password-123' },
  { email: 'bob@chat-genius.local', password: 'test-password-123' },
  { email: 'charlie@chat-genius.local', password: 'test-password-123' },
  { email: 'david@chat-genius.local', password: 'test-password-123' },
];

async function seedData() {
  console.log('Starting seed process...');

  // Create users and profiles
  for (const user of TEST_USERS) {
    try {
      // Check if user exists
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Error listing users:', listError);
        continue;
      }

      const existingUser = existingUsers.users.find((u) => u.email === user.email);
      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`User ${user.email} already exists`);
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (createError) {
          console.error(`Error creating user ${user.email}:`, createError);
          continue;
        }

        userId = newUser.user.id;
        console.log(`Created user ${user.email}`);
      }

      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, email: user.email });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`Created/updated profile for ${user.email}`);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }

  // Create workspaces
  const workspaces = ['Engineering Team', 'Marketing Team', 'General'];
  for (const name of workspaces) {
    try {
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .insert({ name });

      if (workspaceError) {
        console.error(`Error creating workspace ${name}:`, workspaceError);
      } else {
        console.log(`Created workspace ${name}`);
      }
    } catch (error) {
      console.error(`Error creating workspace ${name}:`, error);
    }
  }

  console.log('\nSeed completed successfully!\n');
  console.log('Test users created:');
  TEST_USERS.forEach((user) => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log('---');
  });
}

seedData().catch(console.error); 