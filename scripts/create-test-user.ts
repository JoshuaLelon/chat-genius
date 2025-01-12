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
  const email = 'test@chat-genius.local';
  const password = 'test-password-123';

  // Create the user
  const { data: user, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Automatically confirm the email
  });

  if (createError) {
    console.error('Error creating test user:', createError);
    return;
  }

  // Create profile for the user
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: user.user.id,
      username: 'test-user',
      status: 'online'
    }]);

  if (profileError) {
    console.error('Error creating test profile:', profileError);
    return;
  }

  console.log('Test user created successfully:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('User ID:', user.user.id);
}

createTestUser(); 